const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');  // JWT verification middleware

// Create Appointment
router.post('/appointments', auth, async (req, res) => {
    try {
        const { counselor, sessionType, date, time } = req.body;
        if (!counselorId || !sessionType || !date || !time) {
          return res.status(400).json({ message: "All fields are required" });
        }

        // Create appointment
        const appointment = new Appointment({
            clientId: req.user.id, // From JWT token
            counselor,
            sessionType,
            date,
            time
        });

        await appointment.save();
        res.status(200).json({ message: 'Appointment created successfully', appointment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to schedule the appointment. Try again.' });
    }
});

module.exports = router;
