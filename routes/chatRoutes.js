const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const { verifyToken } = require('../middleware/auth');

router.get('/chat/:appointmentId', verifyToken, async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    let chat = await Chat.findOne({ appointmentId: mongoose.Types.ObjectId(appointmentId) });

    if (!chat) {
      chat = new Chat({
        appointmentId: mongoose.Types.ObjectId(appointmentId),
        messages: []
      });
      await chat.save();
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error.message);
    return res.status(500).json({ message: 'Error fetching chat.' });
  }
});

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

    if (appointment.client.toString() !== userId && appointment.counselor.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to send messages for this appointment.' });
    }

    const sender = appointment.client.toString() === userId ? 'Client' : 'Counselor';

    let chat = await Chat.findOne({ appointmentId: mongoose.Types.ObjectId(appointmentId) });
    if (!chat) {
      chat = new Chat({
        appointmentId: mongoose.Types.ObjectId(appointmentId),
        messages: []
      });
      await chat.save();
    }

    chat.messages.push({ sender, text: message, timestamp: new Date() });
    await chat.save();

    return res.status(201).json({ sender, text: message, timestamp: new Date() });
  } catch (error) {
    console.error('Error sending message:', error.message);
    return res.status(500).json({ message: 'Error sending message.' });
  }
});

module.exports = router;
