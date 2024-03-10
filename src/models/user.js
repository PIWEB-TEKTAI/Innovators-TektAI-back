const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
   
  },
  LastName: {
    type: String,
    required: true,
   
  },
  email: {
    type: String,
    required: true,
    unique:true
   
  },
  password: {
    type: String,
    required: function () {
      return !this.isExternalUser;
    },  
  },
  imageUrl: { 
    type: String,
    default:"http://localhost:3000/images/user_3177440.png"
  },
  phone: {
    type: String,
  }, 
  address:{
    type : String,
  },
  birthDate:{
    type:Date,
    required:false
  },
  occupation:{
    type:String,
    required: function () {
      return !this.isExternalUser;
    },  
  },
  Description:{
    type:String
  },
  Education:{
    type:String
  },
  Skills:{
     type:Array
  },
  isExternalUser:{
    type:Boolean
  },
  company:{
      name: {
        type: String,
       
      },
      address: {
        type: String,
      },
      email: {
        type: String,
   
      },
      description:{
        type:String,
      },
      phone: {
        type: String,
      },
      professionnalFields:{
        type:Array,
      }
    },

    permissions: {
      type: Array,
    },

   isEmailVerified:{
        type:Boolean
   },
   contry:String,

   state:{
        type:String,
        enum: ['validated','not validated'],
        default:"not validated",
    },
    role: {
        type: String,
        enum: ["super admin", "admin" ,"challenger","company"],
        required: [true, 'please provide a user role'],
    },

    previousPasswords: [{ type: String }],


  isDeactivated: {
    type: Boolean,
    default: false 
  },
  wasDeactivated: {
    type: Boolean,
    default: false // Initialize wasDeactivated with a default value of false
  }

},




{ timestamps: true });


userSchema.set('primaryKey', 'email');



const User = mongoose.model('User', userSchema);

module.exports = User;