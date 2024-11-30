// /models/counselorModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const counselorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'counselor' },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  availability: [
    {
      date: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
}, { timestamps: true });

// Hash password before saving
counselorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
counselorSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const Counselor = mongoose.model('Counselor', counselorSchema);
module.exports = Counselor;
