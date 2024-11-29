const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

// POST /schedule-appointment
router.post('/schedule-appointment', async (req, res) => {
  const { counselorId, sessionType, date, time } = req.body;

  // Validate if all necessary fields are provided
  if (!counselorId || !sessionType || !date || !time) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Create a new appointment
    const appointment = new Appointment({
      counselor: counselorId,
      sessionType,
      date,
      time,
    });

    await appointment.save();
    return res.status(200).json({ message: 'Appointment scheduled successfully!' });
  } catch (error) {
    console.error('Error scheduling appointment:', error.message);
    return res.status(500).json({ message: 'Failed to schedule appointment. Please try again.' });
  }
});

// GET /appointments - Fetch all appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('counselor', 'name specialization')
      .exec();
    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error.message);
    return res.status(500).json({ message: 'Failed to fetch appointments.' });
  }
});
router.get('/appointments/:appointmentId', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('client')   // Populating the client field
      .populate('counselor'); // Populating the counselor field

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Error fetching appointment details' });
  }
});

module.exports = router;
