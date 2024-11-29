const mongoose = require('mongoose');

const counselorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  availability: [
    {
      date: { type: Date, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    }
  ]
});

const Counselor = mongoose.model('Counselor', counselorSchema);

module.exports = Counselor;
