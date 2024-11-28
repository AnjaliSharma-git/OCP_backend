const express = require('express');
const Client = require('../models/Client');
const Appointment = require('../models/Appointment');
const { verifyToken } = require('../middleware/auth'); // Custom middleware for token verification
const router = express.Router();

// Middleware to check if the user is authenticated
router.use(verifyToken);

// Get client profile
router.get('/profile', async (req, res) => {
  try {
    // Fetch the client from the database using the authenticated user's ID
    const client = await Client.findById(req.user.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client); // Return the client profile
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching client profile' });
  }
});

// Schedule an appointment
router.post('/schedule', async (req, res) => {
  const { counselorId, date, time, sessionType } = req.body;
  
  // Validate input fields
  if (!counselorId || !date || !time || !sessionType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create a new appointment document
    const appointment = new Appointment({
      clientId: req.user.id,
      counselorId,
      date,
      time,
      sessionType,
    });

    // Save the appointment to the database
    await appointment.save();

    // Optionally, add the appointment ID to the client (to keep track of appointments)
    const client = await Client.findById(req.user.id);
    client.appointments.push(appointment._id);
    await client.save();

    res.status(201).json({ message: 'Appointment scheduled successfully', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error scheduling appointment' });
  }
});

// Get client appointments
router.get('/appointments', async (req, res) => {
  try {
    // Find all appointments of the authenticated client
    const appointments = await Appointment.find({ clientId: req.user.id }).populate('counselorId', 'name specialization experience');
    res.status(200).json(appointments); // Return all appointments with counselor details
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

module.exports = router;
