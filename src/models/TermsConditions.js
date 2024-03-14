const mongoose = require('mongoose');


const TermsConditionsSchema = new mongoose.Schema({

    title: {
      type: String,
    },
    content: {
      type: String,       
    },
},
 { timestamps: true }
);


module.exports = mongoose.model('TermsConditions', TermsConditionsSchema);