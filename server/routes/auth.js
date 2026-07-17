const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/login
// Exchanges a short-lived Google ID Token for a long-lived custom JWT
router.post('/login', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Google token is required' });

    // 1. Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    // 2. Create custom JWT valid for 7 days
    const customToken = jwt.sign(
      { 
        id: payload.sub,
        email: payload.email,
        name: payload.name
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, token: customToken });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(401).json({ error: 'Invalid Google token' });
  }
});

module.exports = router;
