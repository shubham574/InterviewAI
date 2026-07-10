const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10s timeout for initial connection
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error('The server will continue running. Retrying in 30 seconds...');
    // Retry connection after 30 seconds
    setTimeout(connectDB, 30000);
  }
};

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error(`MongoDB connection error: ${err}`);
});

// Helper to check if DB is ready
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDBConnected };
