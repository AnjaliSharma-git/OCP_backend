const mongoose = require('mongoose');

// Session Notes Schema
const sessionNotesSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client',  // Reference to Client model
    required: true 
  },
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment',  // Reference to Appointment model
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  file: { 
    type: String  // URL or path to the file (optional)
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
});

// Create and export the model
module.exports = mongoose.model('SessionNotes', sessionNotesSchema);
