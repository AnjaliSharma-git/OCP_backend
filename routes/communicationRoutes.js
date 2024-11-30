const express = require('express');
const nodemailer = require('nodemailer');
const ChatMessage = require('../models/ChatMessage'); // ChatMessage model
const Appointment = require('../models/Appointment'); // Assuming an Appointment model exists
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to verify token and get user info
const verifyToken = require('../middleware/auth');

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
router.post('/chat/send', verifyToken, async (req, res) => {
  const { appointmentId, message } = req.body;
  const userId = req.user.id; // From the JWT token (client or counselor)

  if (!appointmentId || !message) {
    return res.status(400).json({ message: 'Appointment ID and message are required.' });
  }

  try {
    // Verify if the user is authorized to send the message for this appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const sender = appointment.clientId.toString() === userId ? 'Client' : 'Counselor';

    const chatMessage = new ChatMessage({
      appointmentId,
      sender,
      message,
    });

    await chatMessage.save();
    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return res.status(500).json({ message: 'Failed to send message.' });
  }
});

// Fetch Chat Messages
router.get('/chat/:appointmentId', verifyToken, async (req, res) => {
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

  // Set up environment variables for better security
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Set this in .env
      pass: process.env.EMAIL_PASS, // Set this in .env
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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
