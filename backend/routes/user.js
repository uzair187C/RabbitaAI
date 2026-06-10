const express = require('express');
const User = require('../models/User');
const { verifyFirebaseToken } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('GET /api/user/profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile', detail: err.message });
  }
});

router.put('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const { name, phone, bio, preferences } = req.body;
    const $set = {};
    if (name != null) $set.name = name;
    if (phone != null) $set.phone = phone;
    if (bio != null) $set.bio = bio;
    if (preferences) {
      for (const [k, v] of Object.entries(preferences)) {
        if (v != null) $set[`preferences.${k}`] = v;
      }
    }
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error('PUT /api/user/profile error:', err);
    res.status(500).json({ error: 'Failed to update profile', detail: err.message });
  }
});

module.exports = router;
