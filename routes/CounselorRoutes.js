const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Counselor = require('../models/Counselor');
const Client = require('../models/Client'); // Assuming you have a Client model
const Appointment = require('../models/Appointment'); // Assuming Appointment model is already set up
const router = express.Router();

// Route to register a counselor
router.post("/register-counselor", async (req, res) => {
  const { name, email, password, specialization, experience, availability } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !specialization || !experience || !availability) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if counselor already exists
    const existingCounselor = await Counselor.findOne({ email });
    if (existingCounselor) {
      return res.status(400).json({ message: "Counselor already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new counselor
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

// Route to get all counselors (with optional pagination)
router.get('/counselors', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;  // Default to page 1, limit 10
    const counselors = await Counselor.find()
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json(counselors);
  } catch (error) {
    console.error('Error fetching counselors:', error.message);
    return res.status(500).json({ message: 'Failed to fetch counselors.' });
  }
});

// Middleware to authenticate the user and extract clientId from the token
const authenticateClient = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret
    req.clientId = decoded.clientId; // Store clientId in the request object
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Route to schedule an appointment (uses the `authenticateClient` middleware)
router.post('/appointments', authenticateClient, async (req, res) => {
  const { counselor, sessionType, date, time } = req.body;
  
  try {
    // Validate required fields
    if (!counselor || !sessionType || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create the appointment document
    const appointment = new Appointment({
      clientId: req.clientId,  // From JWT token
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
    console.error('Error scheduling appointment:', err);
    res.status(500).json({ message: 'Failed to schedule the appointment. Try again later.' });
  }
});

module.exports = router;
