const express = require('express');
const mongoose = require('mongoose');
const admin = require('../config/firebaseAdmin');
const User = require('../models/User');

const router = express.Router();

router.post('/verify', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database not connected. Check MongoDB Atlas and backend terminal.',
    });
  }
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(header.slice(7));
    const user = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email?.split('@')[0],
      },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) {
    console.error('Auth verify failed:', err.message);
    res.status(401).json({ error: 'Invalid auth token' });
  }
});

module.exports = router;
