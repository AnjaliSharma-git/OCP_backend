const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  counselorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Counselor', 
    required: true 
  },
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  sessionType: { 
    type: String, 
    required: true,
    enum: ['video_call', 'chat', 'email'], // Ensuring only valid session types are accepted
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true,
    match: /^(0[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/ // Validates time format (HH:MM AM/PM)
  },
  status: { 
    type: String, 
    default: 'scheduled', 
    enum: ['scheduled', 'completed', 'canceled', 'missed'], // Valid status types
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
