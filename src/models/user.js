const mongoose = require('mongoose');
const bcrypt = require('bcrypt')


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
  skills:{
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

    previousPasswords: [{ type: String }]
  },


{ timestamps: true });


userSchema.pre('save', async function (){
  const salt =await bcrypt.genSalt(10)
  this.password= await bcrypt.hash(this.password, salt)
})


const User = mongoose.model('User', userSchema);

module.exports = User;