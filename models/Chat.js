const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  messages: [
    {
      sender: { type: String, required: true }, // e.g., 'client' or 'counselor'
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
