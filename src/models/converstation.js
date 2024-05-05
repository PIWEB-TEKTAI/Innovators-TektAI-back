const mongoose = require('mongoose');

const converstationSchema = new mongoose.Schema({

  participants: 
  [{ type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],

  messages: [{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Message' 
    }],

  team : {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Team'
  }   
});

module.exports = mongoose.model('Converstation', converstationSchema);
