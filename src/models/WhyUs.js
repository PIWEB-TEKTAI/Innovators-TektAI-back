const mongoose = require('mongoose');

const WhyUsSchema = new mongoose.Schema({
  title: String,
  contentwhy: String

});

module.exports = mongoose.model('WhyUs', WhyUsSchema);
