const express = require("express");
const Counselor = require("../models/Counselor");
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

    // Create new counselor
    const newCounselor = new Counselor({
      name,
      email,
      password, // Ideally hashed before saving (e.g., bcrypt.hash(password, salt))
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

// Route to get all counselors
router.get("/", async (req, res) => {
  try {
    // Fetch counselors with specific fields
    const counselors = await Counselor.find({}, "name specialization experience availability");
    res.status(200).json(counselors); // Send counselor data to the client
  } catch (error) {
    console.error("Error fetching counselors:", error);
    res.status(500).json({ message: "Error fetching counselors" });
  }
});

// Route to schedule an appointment
router.post("/schedule-appointment", async (req, res) => {
  const { counselorId, clientId, sessionType, date, time } = req.body;

  try {
    if (!counselorId || !clientId || !sessionType || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    // Placeholder for actual appointment saving logic
    const appointment = {
      counselorId,
      clientId,
      sessionType,
      date,
      time,
    };

    res.status(201).json({ message: "Appointment scheduled successfully", appointment });
  } catch (error) {
    console.error("Error scheduling appointment:", error);
    res.status(500).json({ message: "Server error while scheduling appointment" });
  }
});


module.exports = router;
