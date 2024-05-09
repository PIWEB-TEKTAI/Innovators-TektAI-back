// Require Mongoose
const mongoose = require('mongoose');

// Define Schema for Premium Pack
const PremiumPackSchema = new mongoose.Schema({
    
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },

  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  features: {
    type: [String],
    required: true
  },
 
});

// Define Schema for Freemium Pack
const FreemiumPackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  features: {
    type: [String],
    required: true
  },
 
});


const PlatiniumPackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  features: {
    type: [String],
    required: true
  },

});

// Create models for Premium and Freemium Packs
const PremiumPack = mongoose.model('PremiumPack', PremiumPackSchema);
const FreemiumPack = mongoose.model('FreemiumPack', FreemiumPackSchema);
const PlatiniumPack = mongoose.model('PlatiniumPack', PlatiniumPackSchema);

// Export models
module.exports = {
  PremiumPack,
  FreemiumPack,
  PlatiniumPack
};
