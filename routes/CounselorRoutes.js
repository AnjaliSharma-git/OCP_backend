const express = require("express");
const Counselor = require("../models/Counselor");
const router = express.Router();

// Register counselor
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

    const newCounselor = new Counselor({
      name,
      email,
      password, // For simplicity; ideally hash this with bcrypt
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

// Get all counselors
router.get("/counselor", async (req, res) => {
  try {
    const counselors = await Counselor.find({}, 'name specialization experience availability');
    res.status(200).json(counselors); // Send the counselors' data to the frontend
  } catch (error) {
    console.error("Error fetching counselors:", error);
    res.status(500).json({ message: "Error fetching counselors" });
  }
});

// Schedule an appointment (for example, save the appointment)
router.post("/schedule-appointment", async (req, res) => {
  const { counselorId, clientId, sessionType, date, time } = req.body;

  try {
    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    const appointment = {
      counselorId,
      clientId,
      sessionType,
      date,
      time,
    };

    // Save the appointment logic can go here

    res.status(201).json({ message: "Appointment scheduled successfully", appointment });
  } catch (error) {
    console.error("Error scheduling appointment:", error);
    res.status(500).json({ message: "Server error while scheduling appointment" });
  }
});

module.exports = router;
