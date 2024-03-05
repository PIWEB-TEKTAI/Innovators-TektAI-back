const mongoose = require('mongoose');

const connectDB = (url) => {
  if (!url) {
    console.error('MongoDB connection URL is undefined.');
    return;
  }

  return mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
};

module.exports = connectDB;
