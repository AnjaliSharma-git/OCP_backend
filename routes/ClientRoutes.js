const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const {verifyToken} = require('../middleware/auth');  // JWT verification middleware

// Create Appointment
router.post('/appointments', verifyToken, async (req, res) => {
  try {
    const { counselor, sessionType, date, time } = req.body;

    // Ensure all required fields are provided
    if (!counselor || !sessionType || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create the appointment document
    const appointment = new Appointment({
      clientId: req.user.id,  // From JWT token (authenticated user)
      counselor,
      sessionType,
      date,
      time
    });

    // Save appointment to the database
    await appointment.save();
    
    // Send response with detailed info
    res.status(200).json({
      message: 'Appointment created successfully',
      appointment: {
        id: appointment._id,
        counselor: appointment.counselor,
        sessionType: appointment.sessionType,
        date: appointment.date,
        time: appointment.time,
        clientId: appointment.clientId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to schedule the appointment. Try again later.' });
  }
});

module.exports = router;
