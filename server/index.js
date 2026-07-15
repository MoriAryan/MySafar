require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// For local environment, ensure DB is connected before starting
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 MySafar Server running on http://localhost:${PORT}`);
    });
  });
} else {
  // In serverless environments (Vercel), connect to DB on every request if not cached
  app.use(async (req, res, next) => {
    await connectDB();
    next();
  });
}

// Routes
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/resumes', require('./routes/resumes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the Express API for Vercel
module.exports = app;
