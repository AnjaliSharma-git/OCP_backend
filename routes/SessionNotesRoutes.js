const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SessionNote = require('../models/SessionNote');
const Appointment = require('../models/Appointment');
const router = express.Router();
const { verifyToken } = require("../middleware/auth"); 


const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.docx'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .jpg, .jpeg, .png, .pdf, .docx allowed.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max file size


router.get('/session-notes', verifyToken, async (req, res) => {
  try {
    const notes = await SessionNote.find({ client: req.user.id }); 
    res.status(200).json(notes);
  } catch (err) {
    console.error('Error fetching session notes:', err);
    res.status(500).json({ message: 'Unable to fetch session notes.' });
  }
});

router.post('/session-notes/:appointmentId', upload.single('file'), async (req, res) => {
  const { appointmentId } = req.params;
  const { notes } = req.body;
  const file = req.file ? req.file.filename : null;

  try {
    if (!notes) {
      return res.status(400).json({ message: 'Notes content is required.' });
    }

    const appointmentExists = await Appointment.exists({ _id: appointmentId });
    if (!appointmentExists) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    let sessionNote = await SessionNote.findOne({ appointmentId });
    if (!sessionNote) {
      sessionNote = new SessionNote({
        appointmentId,
        text: notes,
        file: file,
      });
    } else {
      sessionNote.text = notes || sessionNote.text;
      if (file) {
        if (sessionNote.file) {
          fs.unlink(path.join(uploadsDir, sessionNote.file), (err) => {
            if (err) console.error('Failed to delete old file:', err);
          });
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


router.get('/session-notes/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;

  try {
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


router.put('/session-notes/:appointmentId', upload.single('file'), async (req, res) => {
  const { appointmentId } = req.params;
  const { text } = req.body;
  const file = req.file ? req.file.filename : null;

  try {
    const sessionNote = await SessionNote.findOne({ appointmentId });
    if (!sessionNote) {
      return res.status(404).json({ message: 'Session note not found.' });
    }

    sessionNote.text = text || sessionNote.text;
    if (file) {
      if (sessionNote.file) {
        fs.unlink(path.join(uploadsDir, sessionNote.file), (err) => {
          if (err) console.error('Failed to delete old file:', err);
        });
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
