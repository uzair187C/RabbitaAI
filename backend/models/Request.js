const mongoose = require('mongoose');

const conversationMessageSchema = new mongoose.Schema({
  direction: { type: String, enum: ['outbound', 'inbound'], required: true },
  message: { type: String, required: true },
  sentBy: { type: String, enum: ['ai', 'user', 'system'], default: 'ai' },
  requiresUserInput: { type: Boolean, default: false },
  userResponse: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

const providerSchema = new mongoose.Schema({
  placeId: String,
  name: String,
  phone: String,
  rating: Number,
  distanceKm: Number,
  address: String,
  aiExplanation: String,
  selected: { type: Boolean, default: false },
});

const requestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userFirebaseUid: { type: String, required: true },

    status: {
      type: String,
      enum: [
        'searching',
        'awaiting_selection',
        'booking',
        'pending',
        'accepted',
        'in_progress',
        'confirmed',
        'received',    // User confirmed they received the service/order
        'completed',   // Fully done
        'cancelled',
        'failed',
      ],
      default: 'searching',
    },

    originalRequest: { type: String, required: true },
    serviceQuery: { type: String },
    userPrompt: { type: String, default: null },
    context: { type: String },
    requestType: { type: String, enum: ['service', 'order'], default: 'service' },

    searchParams: {
      query: String,
      lat: Number,
      lng: Number,
      radiusKm: Number,
      minRating: Number,
    },

    providers: [providerSchema],
    selectedProvider: {
      name: String,
      phone: String,
      placeId: String,
    },

    conversation: [conversationMessageSchema],

    requiresUserInput: { type: Boolean, default: false },

    receipt: {
      generatedAt: Date,
      providerName: String,
      providerPhone: String,
      serviceType: String,
      scheduledTime: String,
      userArea: String,
      requestId: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
