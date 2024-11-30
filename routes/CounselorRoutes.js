const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Counselor = require('../models/Counselor');
const Client = require('../models/Client'); 
const Appointment = require('../models/Appointment');
const router = express.Router();

router.post("/register-counselor", async (req, res) => {
  const { name, email, password, specialization, experience, availability } = req.body;

  try {
    if (!name || !email || !password || !specialization || !experience || !availability) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingCounselor = await Counselor.findOne({ email });
    if (existingCounselor) {
      return res.status(400).json({ message: "Counselor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCounselor = new Counselor({
      name,
      email,
      password: hashedPassword,
      specialization,
      experience,
      availability,
    });

    await newCounselor.save();
    res.status(201).json({ message: "Counselor registered successfully" });
  } catch (error) {
    console.error("Error registering counselor:", error);
    res.status(500).json({ message: "Server error during counselor registration" });
  }
});


router.get('/counselors', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; 
    const counselors = await Counselor.find()
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json(counselors);
  } catch (error) {
    console.error('Error fetching counselors:', error.message);
    return res.status(500).json({ message: 'Failed to fetch counselors.' });
  }
});

const authenticateClient = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.clientId = decoded.clientId; 
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

router.post('/appointments', authenticateClient, async (req, res) => {
  const { counselor, sessionType, date, time } = req.body;
  
  try {
    if (!counselor || !sessionType || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const appointment = new Appointment({
      clientId: req.clientId,  
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
    console.error('Error scheduling appointment:', err);
    res.status(500).json({ message: 'Failed to schedule the appointment. Try again later.' });
  }
});

module.exports = router;
