const express = require('express');
const Request = require('../models/Request');
const { analyzeProviderMessage } = require('../services/geminiService');
const { sendWhatsAppMessage } = require('../services/whatsappService');

const router = express.Router();

function deriveUserArea(request) {
  const addr = request.selectedProvider?.address || request.providers?.[0]?.address;
  if (addr) return addr.split(',')[0]?.trim() || 'your area';
  return 'your location';
}

function buildReceipt(request, scheduledTime) {
  return {
    requestId: request.requestId,
    service: request.serviceQuery || request.originalRequest,
    provider: request.selectedProvider?.name || 'Provider',
    providerPhone: request.selectedProvider?.phone || null,
    time: scheduledTime || 'As agreed',
    location: deriveUserArea(request),
  };
}

// Meta Webhook Verification
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Meta webhook verified successfully!');
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post('/whatsapp', async (req, res) => {
  // Always return 200 early to prevent Meta from retrying
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    // If no message exists, it's likely a status callback (read, delivered, sent)
    if (!message) {
      return;
    }

    const messageBody = message.text?.body;
    const fromPhone = message.from;
    const messageId = message.id;
    const timestamp = message.timestamp ? new Date(message.timestamp * 1000) : new Date();

    if (!messageBody) {
      console.log(`Received non-text WhatsApp message from ${fromPhone}`);
      return;
    }

    console.log(`Received WhatsApp from ${fromPhone}: ${messageBody}`);

    const match = messageBody.match(/\[REQ-(\d{5})\]/i);
    let request;
    let requestId;

    if (match) {
      requestId = `REQ-${match[1]}`;
      request = await Request.findOne({ requestId });
    } else {
      // Route by provider phone number if tag is missing
      const cleanedFromPhone = fromPhone.replace(/\D/g, '');

      const ACTIVE_STATUSES = ['pending', 'booking', 'accepted', 'in_progress', 'confirmed'];
      request = await Request.findOne({
        'selectedProvider.phone': { $regex: new RegExp(cleanedFromPhone + '$') },
        status: { $in: ACTIVE_STATUSES },
      }).sort({ updatedAt: -1 });

      // Sandbox Fallback: grab the most recent active request by any provider
      if (!request && process.env.DEMO_MODE === 'true') {
        request = await Request.findOne({
          status: { $in: ACTIVE_STATUSES },
        }).sort({ updatedAt: -1 });
        if (request) console.log(`[DEMO_MODE] Fallback routing to request ${request.requestId}`);
      }

      if (request) {
        requestId = request.requestId;
      }
    }

    if (!request) {
      console.log(`Unrouted message from ${fromPhone} (no REQ tag found and no active requests). Ignoring.`);
      return;
    }

    // ── Deduplication: check if we already processed this exact message ──
    const isDuplicate = request.conversation.some(
      (c) => c.direction === 'inbound' && c.message === messageBody &&
        Math.abs(new Date(c.timestamp) - timestamp) < 5000
    );
    if (isDuplicate) {
      console.log(`Duplicate message detected for ${requestId}, skipping.`);
      return;
    }

    const inboundMsg = {
      direction: 'inbound',
      message: messageBody,
      timestamp,
    };
    request.conversation.push(inboundMsg);

    // Fetch full user profile so AI can answer provider questions directly
    let userProfile = { name: '', phone: '', address: '', bio: '', timing: '' };
    try {
      const User = require('../models/User');
      const userDoc = await User.findOne({ firebaseUid: request.userFirebaseUid });
      if (userDoc) {
        userProfile = {
          name:    userDoc.name || '',
          phone:   userDoc.phone || '',
          address: userDoc.preferences?.exactAddress || '',
          area:    userDoc.preferences?.defaultArea || '',
          bio:     userDoc.bio || '',
          timing:  userDoc.preferences?.timing || '',
        };
        console.log(`[Webhook] User profile for ${request.requestId}: name="${userProfile.name}" address="${userProfile.address}" bio="${userProfile.bio}"`);
      }
    } catch (e) {
      console.error('[Webhook] Failed to fetch user profile:', e.message);
    }

    const bookingContext = {
      requestId,
      originalRequest: request.originalRequest,
      serviceQuery:    request.serviceQuery,
      providerName:    request.selectedProvider?.name,
      orderDetails:    request.context || request.originalRequest,
      userProfile,
    };

    let analysis = {
      requiresUserInput: false,
      suggestedReply: null,
      userPrompt: null,
      bookingConfirmed: false,
      scheduledTime: null,
    };

    try {
      analysis = await analyzeProviderMessage(messageBody, bookingContext);
      // Safety: never expose raw provider message as userPrompt
      if (analysis.requiresUserInput && analysis.userPrompt) {
        const raw = analysis.userPrompt;
        if (raw.includes('[REQ-') || raw.length > 120) {
          analysis.userPrompt = `The provider is asking for more details. What time would you like the ${bookingContext.serviceQuery || 'service'}, and any other specifics?`;
        }
      }
    } catch (e) {
      console.warn('Gemini analysis fallback:', e.message);
      analysis.requiresUserInput = true;
      if (/\?/.test(messageBody)) {
        analysis.userPrompt = `The provider has a question about your ${bookingContext.serviceQuery || 'request'}. When would you like the service, and are there any specific details to share?`;
      } else {
        analysis.userPrompt = `The provider just replied: "${messageBody}". How would you like to respond?`;
      }
    }

    const { io } = require('../index');

    if (analysis.requiresUserInput) {
      request.requiresUserInput = true;
      request.userPrompt = analysis.userPrompt || messageBody;
      inboundMsg.requiresUserInput = true;
    } else {
      request.requiresUserInput = false;
      request.userPrompt = null;

      // Failsafe: Never allow AI to ask the provider a question
      if (analysis.suggestedReply && analysis.suggestedReply.includes('?')) {
        request.requiresUserInput = true;
        request.userPrompt = `The provider just asked: "${messageBody}". Please reply:`;
        analysis.suggestedReply = null;
      }

      // Only send auto-reply if it's NOT something the user already said
      if (analysis.suggestedReply && request.selectedProvider?.phone) {
        // Don't auto-reply if the provider just confirmed booking
        if (!analysis.bookingConfirmed) {
          try {
            await sendWhatsAppMessage(request.selectedProvider.phone, analysis.suggestedReply);
            request.conversation.push({
              direction: 'outbound',
              message: analysis.suggestedReply,
              sentBy: 'ai',
              timestamp: new Date(),
            });
          } catch (e) {
            console.error('Auto-reply WhatsApp failed:', e.message);
          }
        }
      }
    }

    if (analysis.bookingConfirmed) {
      const scheduledTime = analysis.scheduledTime || 'As agreed';
      const receipt = buildReceipt(request, scheduledTime);
      request.status = 'confirmed';
      
      let userDetailsStr = '';
      try {
        const User = require('../models/User');
        const user = await User.findOne({ firebaseUid: request.userFirebaseUid });
        if (user) {
          const uName = user.name || 'Customer';
          const uPhone = user.phone || 'Not provided';
          const uAddress = user.preferences?.exactAddress || 'Not provided';
          userDetailsStr = `\n\nCustomer Details:\nName: ${uName}\nPhone: ${uPhone}\nExact Address: ${uAddress}`;
        }
      } catch (err) {
        console.error('Failed to get user details for receipt', err);
      }

      request.receipt = {
        generatedAt: new Date(),
        providerName: receipt.provider,
        providerPhone: receipt.providerPhone,
        serviceType: receipt.service,
        scheduledTime: receipt.time,
        userArea: receipt.location,
        requestId: receipt.requestId,
        sharedWithProvider: true
      };

      const finalMsg = `[${requestId}] Awesome, the booking is confirmed! Here is the final receipt for your records.${userDetailsStr}\n\nThe customer may contact you directly if needed. Thank you for using RabbitaAI!`;
      try {
        if (request.selectedProvider?.phone) {
          await sendWhatsAppMessage(request.selectedProvider.phone, finalMsg);
          request.conversation.push({
            direction: 'outbound',
            message: finalMsg,
            sentBy: 'ai',
            timestamp: new Date(),
          });
        }
      } catch(e) {
        console.error('Failed to send receipt to provider', e);
      }
    }

    await request.save();

    io.to(requestId).emit('conversation-update', {
      direction: 'inbound',
      message: messageBody,
      timestamp,
      requiresUserInput: !!analysis.requiresUserInput,
      userPrompt: analysis.requiresUserInput ? (analysis.userPrompt || messageBody) : null,
    });

    if (!analysis.requiresUserInput && analysis.suggestedReply && !analysis.bookingConfirmed) {
      const lastOutbound = request.conversation[request.conversation.length - 1];
      if (lastOutbound?.direction === 'outbound') {
        io.to(requestId).emit('conversation-update', {
          direction: 'outbound',
          message: lastOutbound.message,
          timestamp: lastOutbound.timestamp,
          requiresUserInput: false,
          userPrompt: null,
        });
      }
    }

    if (analysis.bookingConfirmed) {
      const receipt = buildReceipt(request, analysis.scheduledTime);
      io.to(requestId).emit('booking-confirmed', {
        receipt: {
          ...receipt,
          providerPhone: request.selectedProvider?.phone || null,
        },
      });
    }

  } catch (err) {
    console.error('Webhook error:', err);
  }
});

module.exports = router;
