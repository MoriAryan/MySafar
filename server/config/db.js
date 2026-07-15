const mongoose = require('mongoose');

// Cache the connection for serverless environments
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) {
    console.log('✅ Using existing database connection');
    return cachedDb;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    cachedDb = conn;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
