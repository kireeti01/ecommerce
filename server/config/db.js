const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * Establishes database connection and attaches event listeners for monitoring.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('❌ Error: MONGO_URI environment variable is not defined.');
      process.exit(1);
    }

    // Connection event listeners for real-time visibility
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected from MongoDB Atlas');
    });

    // Connect to database
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Atlas Connected Successfully: ${conn.connection.host} [DB: ${conn.connection.name}]`);
  } catch (error) {
    console.error(`❌ Failed to connect to MongoDB Atlas: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
