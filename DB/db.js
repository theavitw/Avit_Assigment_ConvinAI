const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB database using the specified connection string.
    await mongoose.connect('mongodb://localhost:27017/expensesApp', {
      useNewUrlParser: true, // Use the new URL string parser for MongoDB connection.
      useUnifiedTopology: true, // Use the new server discovery and monitoring engine.
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
