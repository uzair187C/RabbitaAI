const express = require('express');
const User = require('../models/User');
const Request = require('../models/Request');
const { verifyFirebaseToken } = require('../middleware/auth');
const { searchMultipleQueries, reverseGeocode } = require('../services/mapsService');
const { analyzeIntent, rankProviders, composeUserWhatsAppReply, generateAckMessage, generateHelpMessage } = require('../services/geminiService');
const { sendWhatsAppMessage, composeBookingMessage, composeCancellationMessage } = require('../services/whatsappService');
const { getMongoTools } = require('../services/mongoMCPService');

const router = express.Router();

function getIO() {
  return require('../index').io;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateRequestId() {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `REQ-${num}`;
}

function deriveUserArea(request, selectedProvider) {
  if (selectedProvider?.address) {
    const parts = selectedProvider.address.split(',');
    return parts[0]?.trim() || 'your area';
  }
  if (request.searchParams?.lat && request.searchParams?.lng) return 'your location';
  return 'your area';
}

function getServiceEmoji(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('plumb')) return '🔧';
  if (q.includes('electric')) return '⚡';
  if (q.includes('pizza') || q.includes('crown crust')) return '🍕';
  if (q.includes('burger') || q.includes('zinger') || q.includes('broast')) return '🍔';
  if (q.includes('biryani') || q.includes('nihari') || q.includes('karahi')) return '🍛';
  if (q.includes('food') || q.includes('delivery') || q.includes('restaurant')) return '🍽️';
  if (q.includes('clean')) return '🧹';
  if (q.includes('ac') || q.includes('air con')) return '❄️';
  if (q.includes('paint')) return '🎨';
  if (q.includes('car') || q.includes('mechanic')) return '🚗';
  if (q.includes('doctor') || q.includes('medic') || q.includes('clinic')) return '🏥';
  if (q.includes('salon') || q.includes('barber') || q.includes('hair')) return '💇';
  if (q.includes('gym') || q.includes('fitness')) return '🏋️';
  if (q.includes('cafe') || q.includes('coffee') || q.includes('chai')) return '☕';
  return '🔎';
}

// Friendly error message for WhatsApp/booking failures
const SUPPORT_MSG = 'Something went wrong with the booking. Please try again or contact our team at rabbitaxai@gmail.com for help.';

// ── POST /api/requests/new ────────────────────────────────────────────────────
router.post('/new', verifyFirebaseToken, async (req, res) => {
  try {
    const { requestText, lat, lng, conversationHistory } = req.body;

    if (!requestText?.trim()) {
      return res.status(400).json({ error: 'requestText is required' });
    }

    // 1. Get user profile (for preferences)
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 1a. Check if user has address set up — required for booking
    const hasAddress = user.preferences?.exactAddress || user.preferences?.defaultArea;
    const hasPhone = !!user.phone;

    const preferences = user.preferences || {};
    const radiusKm  = preferences.radiusKm || 5;
    const minRating = preferences.minRating || 3.0;

    const searchLat = lat || preferences.defaultLat || 31.4697;
    const searchLng = lng || preferences.defaultLng || 74.4089;

    // 2. Reverse geocode to get actual city/country for Gemini's global context
    const locationContext = await reverseGeocode(searchLat, searchLng);
    locationContext.exactAddress = preferences.exactAddress;
    locationContext.language = preferences.language;
    console.log(`Location Context: ${locationContext.city}, ${locationContext.country}, Lang: ${locationContext.language}`);

    // 3. Full intent analysis via Gemini, passing conversation history
    let intent;
    try {
      intent = await analyzeIntent(requestText, locationContext, conversationHistory);
      console.log(`Intent: action=${intent.action} | queries=${intent.searchQueries?.join(' | ')}`);
    } catch (e) {
      console.warn('analyzeIntent failed, using safe fallback:', e.message);
      
      const isOverloaded = e.message.includes('503') || e.message.includes('overloaded');
      const errorMsg = isOverloaded 
        ? "I'm experiencing unusually high demand right now! 🐇 Please try asking me again in a few seconds." 
        : "System Error: " + e.message + " (Please contact rabbitaxai@gmail.com for support)";
        
      intent = {
        action: 'clarify',
        conversationalResponse: errorMsg,
        searchQueries: [],
        primaryQuery: '',
        specificRequirements: '',
        clarificationQuestion: errorMsg,
        userIntent: requestText,
      };
    }

    // 3a. Handle non-search intents immediately — no Maps call needed
    if (intent.action === 'help') {
      const helpMsg = await generateHelpMessage(requestText, locationContext).catch(
        () => "Hey! 👋 I'm RabbitaAI — tell me what you need and I'll find the best local options near you!"
      );
      return res.json({ requestId: null, providers: [], message: helpMsg });
    }

    if (intent.action === 'chat') {
      // Pre-filter greetings have null conversationalResponse — generate a warm reply
      let chatMessage = intent.conversationalResponse;
      if (!chatMessage) {
        chatMessage = await generateHelpMessage(requestText, locationContext).catch(
          () => "Hey there! 👋 What can I help you with today?"
        );
      }
      return res.json({
        requestId: null,
        providers: [],
        message: chatMessage,
        needsClarification: false,
      });
    }

    if (intent.action === 'clarify') {
      return res.json({
        requestId: null,
        providers: [],
        message: intent.clarificationQuestion || intent.conversationalResponse,
        needsClarification: true,
      });
    }

    // 3b. Before searching, check profile completeness
    if (!hasAddress || !hasPhone) {
      const missing = [];
      if (!hasPhone) missing.push('phone number');
      if (!hasAddress) missing.push('address');
      return res.json({
        requestId: null,
        providers: [],
        message: `Before I can book services for you, I need your ${missing.join(' and ')}. Please complete your profile first! 📋`,
        profileIncomplete: true,
        missingFields: missing,
      });
    }

    // 3. Multi-query Maps search with progressive radius fallback
    let rawProviders = [];
    const radii = [radiusKm, Math.max(radiusKm * 2, 10), 30]; // e.g. 5→10→30km

    for (const radius of radii) {
      const ratingThreshold = radius > radiusKm ? Math.max(minRating - 0.5, 2.5) : minRating;
      try {
        rawProviders = await searchMultipleQueries(
          intent.searchQueries,
          searchLat,
          searchLng,
          radius,
          ratingThreshold,
        );
      } catch (e) {
        console.error(`Maps search failed at ${radius}km:`, e.message);
      }

      if (rawProviders.length > 0) {
        console.log(`Maps: ${rawProviders.length} providers found at ${radius}km`);
        break;
      }
      console.log(`Maps: no results at ${radius}km, expanding radius...`);
    }

    if (rawProviders.length === 0) {
      return res.status(200).json({
        requestId: null,
        providers: [],
        message: `I couldn't find "${intent.primaryQuery}" within 30km of your location. Try rephrasing or mentioning a specific area!`,
      });
    }

    // 4. Gemini ranks with review analysis + specific requirements
    let rankedProviders = [];
    try {
      rankedProviders = await rankProviders(requestText, intent, rawProviders);
    } catch (e) {
      console.warn('Gemini ranking fallback:', e.message);
      rankedProviders = rawProviders.slice(0, 3).map((p) => ({
        ...p,
        aiExplanation: `Rated ${p.rating ?? 'N/A'} ⭐ (${p.userRatingCount || 0} reviews), ${p.distanceKm}km away.`,
        reviewHighlight: null,
      }));
    }

    // 5. Save to MongoDB
    console.log('MongoDB MCP server active');
    const mcpTools = getMongoTools();
    console.log(`MCP tool: ${mcpTools.find((t) => t.name === 'updateRequestStatus')?.name}`);

    const requestId = generateRequestId();
    await Request.create({
      requestId,
      userId: user._id,
      userFirebaseUid: req.user.uid,
      status: 'awaiting_selection',
      originalRequest: requestText.trim(),
      serviceQuery: intent.primaryQuery,
      context: intent.context || intent.specificRequirements || requestText.trim(),
      requestType: intent.type || 'service',
      searchParams: { query: intent.primaryQuery, lat: searchLat, lng: searchLng, radiusKm, minRating },
      providers: rankedProviders.map((p) => ({
        placeId: p.placeId,
        name: p.name,
        phone: p.phoneNumber || null,
        rating: p.rating,
        distanceKm: p.distanceKm,
        address: p.address,
        aiExplanation: p.aiExplanation,
      })),
    });

    // 6. Gemini acknowledgement
    let ackMessage = intent.conversationalResponse || `Found ${rankedProviders.length} great ${intent.primaryQuery} options near you 📍`;
    if (intent.conversationalResponse && rankedProviders.length > 0) {
      // Append a small note about the search results to the conversational response
      ackMessage = `${intent.conversationalResponse} (Found ${rankedProviders.length} options)`;
    }

    // 7. Return to frontend
    const emoji = getServiceEmoji(intent.primaryQuery);
    res.json({
      requestId,
      serviceQuery: intent.primaryQuery,
      specificRequirements: intent.specificRequirements,
      requestType: intent.type || 'service',
      ackMessage,
      emoji,
      providers: rankedProviders.map((p) => ({
        placeId: p.placeId,
        name: p.name,
        rating: p.rating,
        userRatingCount: p.userRatingCount,
        distanceKm: p.distanceKm,
        address: p.address,
        phoneNumber: p.phoneNumber || null,
        isOpen: p.isOpen ?? null,
        aiExplanation: p.aiExplanation,
        reviewHighlight: p.reviewHighlight || null,
        emoji,
      })),
    });
  } catch (err) {
    console.error('POST /api/requests/new error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.', detail: err.message });
  }
});

// ── GET /api/requests/history ─────────────────────────────────────────────────
router.get('/history', verifyFirebaseToken, async (req, res) => {
  try {
    const requests = await Request.find({ userFirebaseUid: req.user.uid })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('requestId originalRequest serviceQuery status providers selectedProvider createdAt receipt');

    res.json(requests);
  } catch (err) {
    console.error('GET /api/requests/history error:', err);
    res.status(500).json({ error: 'Could not fetch history.' });
  }
});

// ── POST /api/requests/:requestId/book ───────────────────────────────────────
router.post('/:requestId/book', verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { selectedProvider } = req.body;

    if (!selectedProvider?.name) {
      return res.status(400).json({ error: 'selectedProvider is required' });
    }

    const request = await Request.findOne({ requestId, userFirebaseUid: req.user.uid });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    let phone = selectedProvider.phone || selectedProvider.phoneNumber;
    let name  = selectedProvider.name;

    // In DEMO_MODE, always redirect to test number regardless of provider phone
    if (process.env.DEMO_MODE === 'true') {
      phone = process.env.TEST_PROVIDER_PHONE || process.env.DEMO_PROVIDER_PHONE || phone;
      // DO NOT override 'name' here so it addresses the business by its real name
      console.log(`[DEMO_MODE] Routing booking to test phone: ${phone}`);
    }

    // If still no phone (Maps doesn't always return phone numbers), use test phone as last resort
    if (!phone) {
      if (process.env.TEST_PROVIDER_PHONE) {
        phone = process.env.TEST_PROVIDER_PHONE;
        console.warn(`No provider phone found for ${name} — falling back to TEST_PROVIDER_PHONE`);
      } else {
        return res.status(400).json({ error: 'No phone number available for this provider.' });
      }
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    const userArea    = deriveUserArea(request, selectedProvider);
    const serviceType = request.serviceQuery || request.originalRequest;
    const needsDesc = (request.context && request.context !== request.originalRequest) 
      ? request.context 
      : request.originalRequest;
      
    // Only send the request details in the initial message. 
    // The exact address will only be sent LATER if the provider asks for it in the conversation.
    const details = `They specifically requested: ${needsDesc}` + (request.userPrompt ? `. Clarification: ${request.userPrompt}` : '');

    const messageBody = composeBookingMessage(requestId, userArea, serviceType, name, details);

    let whatsappError = null;
    try {
      await sendWhatsAppMessage(phone, messageBody);
      console.log(`✅ WhatsApp booking message sent to ${phone}`);
    } catch (waErr) {
      whatsappError = waErr.message;
      console.error('❌ WhatsApp FAILED:', waErr.message);
    }

    const outboundMsg = { direction: 'outbound', message: messageBody, sentBy: 'ai', timestamp: new Date() };

    // status must be 'pending' so the webhook can route inbound provider replies
    request.status = 'pending';
    request.selectedProvider = { name, phone, placeId: selectedProvider.placeId || selectedProvider.id };
    request.conversation.push(outboundMsg);
    await request.save();

    const io = getIO();
    if (io) io.to(requestId).emit('conversation-update', { ...outboundMsg, requiresUserInput: false, userPrompt: null });

    // If WhatsApp failed, still return success (booking is saved) but warn the user
    if (whatsappError) {
      return res.json({
        success: true,
        message: messageBody,
        whatsappError,
        warning: 'Booking saved but WhatsApp message could not be sent. Please try again or contact rabbitaxai@gmail.com.',
      });
    }

    res.json({ success: true, message: messageBody, whatsappError: null });
  } catch (err) {
    console.error('POST /api/requests/:requestId/book error:', err);
    res.status(500).json({ error: SUPPORT_MSG, detail: err.message });
  }
});

// ── POST /api/requests/:requestId/reply ──────────────────────────────────────
router.post('/:requestId/reply', verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userReply } = req.body;

    if (!userReply?.trim()) return res.status(400).json({ error: 'userReply is required' });

    const request = await Request.findOne({ requestId, userFirebaseUid: req.user.uid });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const phone = request.selectedProvider?.phone;
    if (!phone) return res.status(400).json({ error: 'No provider selected for this request' });

    // Fetch user profile to enrich the reply
    let userProfile = { name: '', phone: '', address: '', bio: '', timing: '' };
    try {
      const userDoc = await User.findOne({ firebaseUid: req.user.uid });
      if (userDoc) {
        userProfile = {
          name:    userDoc.name || '',
          phone:   userDoc.phone || '',
          address: userDoc.preferences?.exactAddress || '',
          area:    userDoc.preferences?.defaultArea || '',
          bio:     userDoc.bio || '',
          timing:  userDoc.preferences?.timing || '',
        };
      }
    } catch (e) {
      console.warn('Could not fetch user profile for reply:', e.message);
    }

    let composedReply;
    try {
      composedReply = await composeUserWhatsAppReply(userReply.trim(), request.conversation, {
        requestId,
        originalRequest: request.originalRequest,
        orderDetails:    request.context || request.originalRequest,
        serviceQuery:    request.serviceQuery,
        providerName:    request.selectedProvider?.name,
        userProfile,
      });
    } catch (e) {
      console.warn('Gemini compose fallback:', e.message);
      composedReply = `[${requestId}] ${userReply.trim()}`;
    }

    await sendWhatsAppMessage(phone, composedReply);

    // Only store the composed reply — not the raw user text separately to avoid duplicate messages
    const aiMsg = { direction: 'outbound', message: composedReply, sentBy: 'ai', timestamp: new Date() };

    request.conversation.push(aiMsg);
    request.requiresUserInput = false;
    request.userPrompt = null;
    await request.save();

    const io = getIO();
    if (io) {
      io.to(requestId).emit('conversation-update', { ...aiMsg, requiresUserInput: false, userPrompt: null });
    }

    res.json({ success: true, message: composedReply });
  } catch (err) {
    console.error('POST /api/requests/:requestId/reply error:', err);
    res.status(500).json({ error: SUPPORT_MSG, detail: err.message });
  }
});

// ── POST /api/requests/:requestId/addon ──────────────────────────────────────
router.post('/:requestId/addon', verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { addonText } = req.body;

    if (!addonText?.trim()) return res.status(400).json({ error: 'addonText is required' });

    const request = await Request.findOne({ requestId, userFirebaseUid: req.user.uid });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const phone = request.selectedProvider?.phone;
    if (!phone) return res.status(400).json({ error: 'No provider selected — cannot send add-on.' });

    // Compose the message via Gemini or fallback
    let composedMsg;
    try {
      composedMsg = await composeUserWhatsAppReply(addonText.trim(), request.conversation, {
        requestId,
        originalRequest: request.originalRequest,
        serviceQuery: request.serviceQuery,
        providerName: request.selectedProvider?.name,
      });
    } catch (e) {
      console.warn('Gemini addon compose fallback:', e.message);
      composedMsg = `[${requestId}] Additional detail: ${addonText.trim()}`;
    }

    // Send to the business via WhatsApp
    await sendWhatsAppMessage(phone, composedMsg);
    console.log(`✅ Add-on sent to provider for ${requestId}`);

    const userMsg = { direction: 'outbound', message: `Add-on: ${addonText.trim()}`, sentBy: 'user', timestamp: new Date() };
    const aiMsg = { direction: 'outbound', message: composedMsg, sentBy: 'ai', timestamp: new Date() };

    request.conversation.push(userMsg, aiMsg);
    await request.save();

    const io = getIO();
    if (io) {
      io.to(requestId).emit('conversation-update', { ...aiMsg, requiresUserInput: false, userPrompt: null });
    }

    res.json({ success: true, message: composedMsg });
  } catch (err) {
    console.error('POST /api/requests/:requestId/addon error:', err);
    res.status(500).json({ error: SUPPORT_MSG, detail: err.message });
  }
});

// ── POST /api/requests/:requestId/cancel ─────────────────────────────────────
router.post('/:requestId/cancel', verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findOne({ requestId, userFirebaseUid: req.user.uid });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Send cancellation message to business if there's a selected provider
    if (request.selectedProvider?.phone) {
      try {
        const cancelMsg = composeCancellationMessage(requestId);
        await sendWhatsAppMessage(request.selectedProvider.phone, cancelMsg);
        request.conversation.push({
          direction: 'outbound',
          message: cancelMsg,
          sentBy: 'system',
          timestamp: new Date(),
        });
        console.log(`✅ Cancellation message sent for ${requestId}`);
      } catch (waErr) {
        console.error('Cancellation WhatsApp failed (proceeding anyway):', waErr.message);
      }
    }

    request.status = 'cancelled';
    request.requiresUserInput = false;
    request.userPrompt = null;
    await request.save();

    const io = getIO();
    if (io) io.to(requestId).emit('booking-cancelled', { requestId });

    res.json({ success: true, message: 'Booking cancelled.' });
  } catch (err) {
    console.error('POST /api/requests/:requestId/cancel error:', err);
    res.status(500).json({ error: SUPPORT_MSG, detail: err.message });
  }
});

// ── POST /api/requests/:requestId/received ───────────────────────────────────
// User confirms they received the service/order
router.post('/:requestId/received', verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findOne({ requestId, userFirebaseUid: req.user.uid });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'received';
    request.conversation.push({
      direction: 'outbound',
      message: 'User confirmed: Order/Service received ✅',
      sentBy: 'system',
      timestamp: new Date(),
    });
    await request.save();

    // Notify provider that user confirmed
    if (request.selectedProvider?.phone) {
      try {
        const thankYouMsg = `[${requestId}] The customer has confirmed receiving the service. Thank you for your excellent work! 🙏`;
        await sendWhatsAppMessage(request.selectedProvider.phone, thankYouMsg);
      } catch (e) {
        console.warn('Thank you message failed:', e.message);
      }
    }

    const io = getIO();
    if (io) io.to(requestId).emit('booking-received', { requestId });

    res.json({ success: true, message: 'Marked as received.' });
  } catch (err) {
    console.error('POST /api/requests/:requestId/received error:', err);
    res.status(500).json({ error: SUPPORT_MSG, detail: err.message });
  }
});

// ── GET /api/requests/:requestId ─────────────────────────────────────────────
router.get('/:requestId', verifyFirebaseToken, async (req, res) => {
  try {
    const request = await Request.findOne({
      requestId: req.params.requestId,
      userFirebaseUid: req.user.uid,
    }).select('requestId status selectedProvider conversation serviceQuery originalRequest requiresUserInput userPrompt receipt');

    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (err) {
    console.error('GET /api/requests/:requestId error:', err);
    res.status(500).json({ error: 'Could not fetch request.' });
  }
});

module.exports = router;
