const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();
const verifyToken = require('../middleware/auth'); // This import can be kept for other routes if necessary

// POST /schedule-appointment - Schedule a new appointment
router.post('/schedule-appointment', verifyToken, async (req, res) => {
  const { counselorId, clientId, sessionType, date, time } = req.body;

  if (!counselorId || !clientId || !sessionType || !date || !time) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const appointmentDate = new Date(`${date}T${time}:00`);

    const appointment = new Appointment({
      counselorId,
      clientId,
      sessionType,
      date: appointmentDate,
      time,
    });

    await appointment.save();
    return res.status(201).json({ message: 'Appointment scheduled successfully!' });
  } catch (error) {
    console.error('Error scheduling appointment:', error.message);
    return res.status(500).json({ message: 'Failed to schedule appointment. Please try again.' });
  }
});

// GET /appointments - Fetch all appointments (No client validation)
router.get('/appointments', async (req, res) => {  // Removed verifyToken
  try {
    // Fetch all appointments from the database
    const appointments = await Appointment.find()
      .populate('counselorId', 'name specialization')
      .populate('clientId', 'name email')
      .exec();

    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointments found.' });
    }

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error.stack);  // More detailed error logging
    return res.status(500).json({ message: 'Failed to fetch appointments.' });
  }
});

// GET /appointments/counselor/:counselorId - Fetch appointments for a specific counselor


// GET /appointments/:appointmentId - Fetch appointment by ID (used for detail view)
router.get('/appointments/:appointmentId', async (req, res) => {  // Removed verifyToken
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required.' });
    }

    const appointment = await Appointment.findById(appointmentId).exec();

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error.message);
    return res.status(500).json({ message: 'Failed to fetch appointment details.' });
  }
});

module.exports = router;
