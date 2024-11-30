const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const { verifyToken } = require('../middleware/auth');

// Get messages for a specific appointment or create a new chat if it doesn't exist
router.get('/chat/:appointmentId', verifyToken, async (req, res) => {
  const { appointmentId } = req.params;

  try {
    // Ensure appointmentId is a valid ObjectId
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Check if a chat exists for this appointment
    let chat = await Chat.findOne({ appointmentId: mongoose.Types.ObjectId(appointmentId) });

    if (!chat) {
      // If no chat exists, create a new one
      chat = new Chat({
        appointmentId: mongoose.Types.ObjectId(appointmentId),
        messages: []
      });
      await chat.save();
    }

    // Return the chat or an empty chat if new
    return res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error.message);
    return res.status(500).json({ message: 'Error fetching chat.' });
  }
});

// Send a message for a specific appointment
router.post('/chat/:appointmentId', verifyToken, async (req, res) => {
  const { appointmentId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message content is required.' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const userId = req.user.id;

    // Check if the user is authorized to send a message for this appointment
    if (appointment.client.toString() !== userId && appointment.counselor.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to send messages for this appointment.' });
    }

    const sender = appointment.client.toString() === userId ? 'Client' : 'Counselor';

    // Find the chat, or create a new one if it doesn't exist
    let chat = await Chat.findOne({ appointmentId: mongoose.Types.ObjectId(appointmentId) });
    if (!chat) {
      chat = new Chat({
        appointmentId: mongoose.Types.ObjectId(appointmentId),
        messages: []
      });
      await chat.save();
    }

    // Push the new message into the chat
    chat.messages.push({ sender, text: message, timestamp: new Date() });
    await chat.save();

    return res.status(201).json({ sender, text: message, timestamp: new Date() });
  } catch (error) {
    console.error('Error sending message:', error.message);
    return res.status(500).json({ message: 'Error sending message.' });
  }
});

module.exports = router;
