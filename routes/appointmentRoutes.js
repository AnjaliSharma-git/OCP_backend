const express = require('express');
const Appointment = require('../models/Appointment');
const Counselor = require('../models/Counselor');
const Client = require('../models/Client');

const router = express.Router();

// Schedule an appointment
router.post('/schedule', async (req, res) => {
  const { counselorId, date, time, modeOfInteraction, clientId } = req.body;

  try {
    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor not found' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const newAppointment = new Appointment({
      counselorId,
      date,
      time,
      modeOfInteraction,
      clientId
    });

    await newAppointment.save();

    client.appointments.push(newAppointment);
    await client.save();

    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all appointments for a client
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({ clientId: req.clientId })
      .populate('counselorId')
      .exec();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
