const mongoose = require('mongoose');


const TokenSchema = new mongoose.Schema({

 userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
  token: { 
    type: String,
    required: true 
 },
},
 { timestamps: true }
);

TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });




module.exports = mongoose.model('Token', TokenSchema);