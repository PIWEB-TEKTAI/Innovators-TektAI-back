const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true

  },
  FirstName: {
    type: String,
    required: true,

  },
  LastName: {
    type: String,
    required: true,

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
  address: {
    type: String,
  },
  birthDate: {
    type: Date,
    required: false
  },
  occupation: {
    type: String,
    required: true
  },
  Description: {
    type: String
  },
  Education: {
    type: String
  },
  Skills: {
    type: String
  },
  company: {
    name: {
      type: String,

    },
    address: {
      type: String,
    },
    emailCompany: {
      type: String,

    },
    description: {
      type: String,
    },
    phone: {
      type: String,
    },
    professionnalFields: {
      type: Array,
    }
  },

  isEmailVerified: {
    type: Boolean
  },

  state: {
    type: String,
    enum: ['validated', 'not validated', 'blocked'],
    default: "not validated",
  },
  role: {
    type: String,
    enum: ["super admin", "admin", "challenger", "company"],
    required: [true, 'please provide a user role'],
  },
}, { timestamps: true });

userSchema.set('primaryKey', 'email');

const User = mongoose.model('User', userSchema);

module.exports = User;