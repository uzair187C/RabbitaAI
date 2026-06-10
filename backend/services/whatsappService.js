/**
 * WhatsApp Cloud API Service
 */

function normalizePhoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

/**
 * Send a WhatsApp message using Meta Graph API.
 * @param {string} toPhone - Provider phone
 * @param {string} messageBody - Message text
 */
async function sendWhatsAppMessage(toPhone, messageBody) {
  let cleanedPhone = normalizePhoneDigits(toPhone);
  if (!cleanedPhone) throw new Error('Provider phone number is missing');

  if (process.env.TEST_PROVIDER_PHONE && process.env.DEMO_MODE === 'true') {
    cleanedPhone = normalizePhoneDigits(process.env.TEST_PROVIDER_PHONE);
    console.log(`[DEMO MODE] Rerouting WhatsApp to test number: ${cleanedPhone}`);
  }

  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneId || !token) {
    throw new Error('WHATSAPP_PHONE_ID or WHATSAPP_TOKEN not set in environment');
  }

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: cleanedPhone,
    type: 'text',
    text: { body: messageBody }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta WhatsApp API Error:', JSON.stringify(data, null, 2));
      throw new Error(`WhatsApp API error: ${data.error?.message || response.statusText}`);
    }

    console.log(`WhatsApp sent to ${cleanedPhone}, Message ID: ${data.messages?.[0]?.id}`);
    return data.messages?.[0]?.id;
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err);
    throw err;
  }
}

/**
 * Compose the initial booking outreach message for a provider.
 */
function composeBookingMessage(requestId, userArea, serviceType, providerName, additionalDetails) {
  const lines = [
    `[${requestId}] Hello ${providerName}!`,
    ``,
    `A customer near ${userArea} is requesting: ${serviceType}.`,
    additionalDetails ? additionalDetails : '',
    ``,
    `Please reply starting with [${requestId}] so we can route your message correctly.`,
    `Are you available?`,
  ].filter(l => l !== undefined);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Compose cancellation message when request is fulfilled
 */
function composeCancellationMessage(requestId) {
  return `[${requestId}] Hi, this request has just been fulfilled by another provider. Thank you for your time — we will reach out again for future requests!`;
}

module.exports = { sendWhatsAppMessage, composeBookingMessage, composeCancellationMessage };
