const express = require('express');
const Appointment = require('../models/Appointment');
const { verifyToken } = require('../middleware/auth'); // Verify token middleware

const router = express.Router();

// POST /schedule-appointment - Schedule a new appointment
router.post('/schedule-appointment', verifyToken, async (req, res) => {
  const { counselor, sessionType, date, time } = req.body;
  const client = req.user.id; // Retrieved from the JWT via verifyToken middleware

  try {
    // Validate request data
    if (!counselor || !sessionType || !date || !time || !client) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate date and time (future appointments only)
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    if (selectedDateTime <= now) {
      return res.status(400).json({ message: 'Appointments must be scheduled for a future date and time.' });
    }

    // Check for overlapping appointments
    const overlappingAppointment = await Appointment.findOne({
      counselor,
      date,
      time,
    });
    if (overlappingAppointment) {
      return res.status(400).json({ message: 'The selected time slot is already booked.' });
    }

    // Create and save the appointment
    const appointment = new Appointment({
      counselor,
      client,
      sessionType,
      date,
      time,
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment scheduled successfully.', appointment });
  } catch (error) {
    console.error('Error scheduling appointment:', error.stack);
    res.status(500).json({ message: 'Error scheduling appointment.' });
  }
});

// GET /appointments - Fetch all appointments
router.get('/appointments', verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('counselor', 'name specialization') // Populate counselor details
      .populate('client', 'name email') // Populate client details
      .exec();

    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointments found.' });
    }

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error.stack);
    return res.status(500).json({ message: 'Failed to fetch appointments.' });
  }
});

// GET /appointments/counselor/:counselorId - Fetch appointments for a specific counselor
router.get('/appointments/counselor/:counselorId', verifyToken, async (req, res) => {
  const { counselorId } = req.params;

  try {
    const appointments = await Appointment.find({ counselor: counselorId })
      .populate('client', 'name email') // Populate client details
      .exec();

    if (!appointments.length) {
      return res.status(404).json({ message: `No appointments found for counselor ${counselorId}.` });
    }

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching counselor appointments:', error.stack);
    return res.status(500).json({ message: 'Failed to fetch counselor appointments.' });
  }
});

// GET /appointments/:appointmentId - Fetch appointment by ID
router.get('/appointments/:appointmentId', verifyToken, async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('counselor', 'name specialization') // Populate counselor details
      .populate('client', 'name email') // Populate client details
      .exec();

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment details:', error.stack);
    return res.status(500).json({ message: 'Failed to fetch appointment details.' });
  }
});

module.exports = router;
