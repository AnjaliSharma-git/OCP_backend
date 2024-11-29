const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SessionNote = require('../models/SessionNote'); // SessionNote schema
const Appointment = require('../models/Appointment'); // Appointment schema
const router = express.Router();

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filenames
  },
});
const upload = multer({ storage: storage });

/**
 * Create or Update Session Notes
 * Route: POST /api/session-notes/:appointmentId
 */
router.post('/:appointmentId', upload.single('file'), async (req, res) => {
  const { appointmentId } = req.params;
  const { notes } = req.body;
  const file = req.file ? req.file.filename : null;

  try {
    // Check if the appointment exists
    const appointmentExists = await Appointment.exists({ _id: appointmentId });
    if (!appointmentExists) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Check if session notes already exist
    let sessionNote = await SessionNote.findOne({ appointmentId });
    if (!sessionNote) {
      // Create a new session note
      sessionNote = new SessionNote({
        appointmentId,
        text: notes,
        file: file,
      });
    } else {
      // Update existing session note
      sessionNote.text = notes || sessionNote.text;
      if (file) {
        // Delete old file if it exists
        if (sessionNote.file) {
          fs.unlinkSync(`./uploads/${sessionNote.file}`);
        }
        sessionNote.file = file;
      }
    }

    await sessionNote.save();
    res.status(200).json({ message: 'Session notes saved successfully.' });
  } catch (error) {
    console.error('Error saving session notes:', error);
    res.status(500).json({ message: 'Error saving session notes.' });
  }
});

/**
 * Fetch Session Notes by Appointment ID
 * Route: GET /api/session-notes/:appointmentId
 */
router.get('/', async (req, res) => {
  const { appointmentId } = req.params;

  try {
    // Find session notes for the appointment
    const sessionNote = await SessionNote.findOne({ appointmentId });
    if (!sessionNote) {
      return res.status(404).json({ message: 'Session notes not found.' });
    }

    res.status(200).json({
      text: sessionNote.text,
      file: sessionNote.file,
    });
  } catch (error) {
    console.error('Error fetching session notes:', error);
    res.status(500).json({ message: 'Error fetching session notes.' });
  }
});

/**
 * Update Session Notes
 * Route: PUT /api/session-notes/:appointmentId
 */
router.put('/:appointmentId', upload.single('file'), async (req, res) => {
  const { appointmentId } = req.params;
  const { text } = req.body;
  const file = req.file ? req.file.filename : null;

  try {
    // Find session notes for the appointment
    const sessionNote = await SessionNote.findOne({ appointmentId });
    if (!sessionNote) {
      return res.status(404).json({ message: 'Session note not found.' });
    }

    // Update session note fields
    sessionNote.text = text || sessionNote.text;
    if (file) {
      // Delete old file if it exists
      if (sessionNote.file) {
        fs.unlinkSync(`./uploads/${sessionNote.file}`);
      }
      sessionNote.file = file;
    }

    await sessionNote.save();
    res.status(200).json({ message: 'Session note updated successfully.' });
  } catch (error) {
    console.error('Error updating session note:', error);
    res.status(500).json({ message: 'Error updating session note.' });
  }
});

module.exports = router;
