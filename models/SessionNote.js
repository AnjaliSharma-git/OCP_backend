const mongoose = require('mongoose');

const sessionNotesSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client',  
    required: true 
  },
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  file: { 
    type: String 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('SessionNotes', sessionNotesSchema);
