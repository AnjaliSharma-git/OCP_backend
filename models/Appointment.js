// appointment.js (model definition)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Assuming counselor is a reference to the Counselor model
const appointmentSchema = new Schema({
  sessionType: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },  // Assuming client is a reference to the Client model
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor' }  // Make sure counselor is a reference to the Counselor model
});

module.exports = mongoose.model('Appointment', appointmentSchema);
