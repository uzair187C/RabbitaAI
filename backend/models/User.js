const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: String,
  name: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
  preferences: {
    radiusKm:     { type: Number, default: 5 },
    priceRange:   { type: String, default: 'mid' },
    minRating:    { type: Number, default: 4.0 },
    defaultArea:  String,
    defaultLat:   Number,
    defaultLng:   Number,
    exactAddress: String,   // Delivery/service address — was silently dropped before!
    timing:       [String],   // Preferred timing e.g. ["Morning", "Evening"]
    language:     String,   // Preferred language for AI responses
  },
  bio: { type: String, default: '' },  // Free-form personalization notes
});

module.exports = mongoose.model('User', userSchema);

