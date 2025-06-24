const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');

const UserSchema = new mongoose.Schema({
  uid: { type: String, default: () => uuid(), unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  emailVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  cooldowns: { type: Map, of: Date, default: new Map() }
});

module.exports = mongoose.model('User', UserSchema);