const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  color: { type: String, required: true },
  size: { type: Number, required: true },
  intensidad: { type: Number, required: true },
  city: { type: String, default: null },
  country: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema,'user_logs');
