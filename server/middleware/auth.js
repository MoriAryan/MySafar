const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify our custom JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Sliding Window Implementation:
    // If the token is valid but was issued more than 24 hours ago,
    // we silently issue a fresh 7-day token in the response headers.
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const ageInSeconds = nowInSeconds - decoded.iat;
    
    if (ageInSeconds > 24 * 60 * 60) {
      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email, name: decoded.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Expose the header so CORS allows the browser to read it
      res.set('Access-Control-Expose-Headers', 'x-new-token');
      res.set('x-new-token', newToken);
    }
    
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = auth;
