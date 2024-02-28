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
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  imageUrl: { 
    type: String,
  },
  phone: {
    type: String,
  }, 
  address:{
    type : String,
  },
  birthDate:{
    type:Date,
  },
  occupation:{
    type:String,
  },
  Description:{
    type:String
  },
  Education:{
    type:String
  },
  Skills:{
     type:String
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
        type:String,
      }
    },

   isEmailVerified:{
        type:Boolean,
   },

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
},{ timestamps: true });



userSchema.pre('save', async function (){
  const salt =await bcrypt.genSalt(10)
  this.password= await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema);

module.exports = User;
