const mongoose = require('mongoose');

const sessionNotesSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  appointmentId: { type: String, required: true },
  text: { type: String, required: true },
  file: { type: String }, // Optional file URL
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SessionNotes', sessionNotesSchema);
