const express = require('express');
const nodemailer = require('nodemailer');
const ChatMessage = require('../models/ChatMessage'); // ChatMessage model
const router = express.Router();

// Generate Video Call Link
router.post('/generate-video-call', (req, res) => {
    const { appointmentId } = req.body;
  
    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required.' });
    }
  
    // Generate a unique room name using appointment ID (or a better strategy)
    const roomName = `appointment-${appointmentId}`;
  
    // Jitsi Meet URL (you can use a custom Jitsi server if needed)
    const videoCallLink = `https://meet.jit.si/${roomName}`;
    
    return res.status(200).json({ link: videoCallLink });
  });

// Send Chat Message
router.post('/chat/send', async (req, res) => {
  const { appointmentId, sender, message } = req.body;

  if (!appointmentId || !sender || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const chatMessage = new ChatMessage({ appointmentId, sender, message });
    await chatMessage.save();
    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return res.status(500).json({ message: 'Failed to send message.' });
  }
});

// Fetch Chat Messages
router.get('/chat/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    return res.status(400).json({ message: 'Appointment ID is required.' });
  }

  try {
    const messages = await ChatMessage.find({ appointmentId }).sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return res.status(500).json({ message: 'Failed to fetch chat messages.' });
  }
});

// Send Email
router.post('/send-email', async (req, res) => {
  const { email, subject, body } = req.body;

  if (!email || !subject || !body) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com', // Replace with your email
      pass: 'your-password', // Replace with your email password or app password
    },
  });

  try {
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: subject,
      text: body,
    });
    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email.' });
  }
});

module.exports = router;
