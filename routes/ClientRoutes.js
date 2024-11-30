const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const {verifyToken} = require('../middleware/auth'); 

router.post('/appointments', verifyToken, async (req, res) => {
  try {
    const { counselor, sessionType, date, time } = req.body;


    if (!counselor || !sessionType || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const appointment = new Appointment({
      clientId: req.user.id,  
      counselor,
      sessionType,
      date,
      time
    });

    await appointment.save();
    
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
