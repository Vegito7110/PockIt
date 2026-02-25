const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
  },
  phone_number: {
    type: String,   
    unique: true,
    sparse: true    
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);