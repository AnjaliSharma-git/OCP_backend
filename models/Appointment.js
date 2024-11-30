const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counselor', // Reference to the Counselor model
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client', // Reference to the Client model
    required: true,
  },
  sessionType: {
    type: String,
    enum: ['video_call', 'chat', 'email'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
