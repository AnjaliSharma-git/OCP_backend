const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat'); // Assuming a Chat model exists

// Get messages for a specific appointment
router.get('/chat/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const chat = await Chat.findOne({ appointmentId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found.' });
    }
    return res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error.message);
    return res.status(500).json({ message: 'Error fetching chat.' });
  }
});

// Send a message for a specific appointment
router.post('/chat/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message content is required.' });
  }

  try {
    const chat = await Chat.findOneAndUpdate(
      { appointmentId },
      { $push: { messages: { sender: 'Client', text: message } } },
      { new: true, upsert: true }
    );
    return res.status(201).json({ message: { sender: 'Client', text: message } });
  } catch (error) {
    console.error('Error sending message:', error.message);
    return res.status(500).json({ message: 'Error sending message.' });
  }
});

module.exports = router;