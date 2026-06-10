const admin = require('../config/firebaseAdmin');

async function verifyFirebaseToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' });
  }
  try {
    req.user = await admin.auth().verifyIdToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Invalid auth token' });
  }
}

module.exports = { verifyFirebaseToken };
