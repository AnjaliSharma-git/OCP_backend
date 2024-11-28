const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  modeOfInteraction: { type: String, enum: ['chat', 'video_call', 'email'], required: true }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
