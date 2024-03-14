const mongoose = require('mongoose');

const connectDB = (url) => {
  if (!url) {
    console.error('MongoDB connection URL is undefined.');
    return;
  }

  return mongoose.connect(url);
};

module.exports = connectDB;