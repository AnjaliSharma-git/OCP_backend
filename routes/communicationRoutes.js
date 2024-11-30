const express = require('express');
const nodemailer = require('nodemailer');
const ChatMessage = require('../models/ChatMessage'); 
const Appointment = require('../models/Appointment'); 
const jwt = require('jsonwebtoken');
const router = express.Router();

const verifyToken = require('../middleware/auth');

router.post('/generate-video-call', (req, res) => {
  const { appointmentId } = req.body;

  if (!appointmentId) {
    return res.status(400).json({ message: 'Appointment ID is required.' });
  }

  const roomName = `appointment-${appointmentId}`;
  
  const videoCallLink = `https://meet.jit.si/${roomName}`;

  return res.status(200).json({ link: videoCallLink });
});

router.post('/chat/send', verifyToken, async (req, res) => {
  const { appointmentId, message } = req.body;
  const userId = req.user.id; 

  if (!appointmentId || !message) {
    return res.status(400).json({ message: 'Appointment ID and message are required.' });
  }

  try {
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

router.post('/send-email', async (req, res) => {
  const { email, subject, body } = req.body;

  if (!email || !subject || !body) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS,
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
