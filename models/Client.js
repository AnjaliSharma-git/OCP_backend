// /models/clientModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'client' }, // To differentiate between client and counselor
}, { timestamps: true });

// Hash password before saving
clientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
clientSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;
