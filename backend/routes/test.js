const express = require('express');
const { searchNearbyProviders } = require('../services/mapsService');

const router = express.Router();

router.get('/maps', async (req, res) => {
  try {
    const providers = await searchNearbyProviders(
      'plumber',
      31.4697,
      74.4089,
      5,
      3.5
    );
    res.json(providers);
  } catch (err) {
    console.error('Maps test failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
