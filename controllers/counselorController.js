const bcrypt = require("bcrypt");
const Counselor = require("../models/Counselor");

// Register Counselor
exports.registerCounselor = async (req, res) => {
  const { name, email, password, specialization, experience, availability } = req.body;

  try {
    const existingCounselor = await Counselor.findOne({ email });
    if (existingCounselor) {
      return res.status(400).json({ message: "Counselor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCounselor = new Counselor({
      name,
      email,
      password: hashedPassword,
      specialization,
      experience,
      availability,
    });

    await newCounselor.save();
    res.status(201).json({ message: "Counselor registered successfully" });
  } catch (error) {
    console.error("Error registering counselor:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Counselor Availability
exports.updateAvailability = async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  try {
    const counselor = await Counselor.findById(id);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    counselor.availability = availability;
    await counselor.save();

    res.status(200).json({ message: "Availability updated successfully" });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Counselors List
exports.getCounselors = async (req, res) => {
  try {
    const counselors = await Counselor.find();
    res.status(200).json(counselors);
  } catch (error) {
    console.error("Error fetching counselors:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Handle Appointment Scheduling (simple example)
exports.scheduleAppointment = async (req, res) => {
  const { counselorId, clientId, sessionType, date, time } = req.body;

  try {
    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    const isAvailable = counselor.availability.some(
      (slot) => slot.day === date && slot.startTime <= time && slot.endTime >= time
    );

    if (!isAvailable) {
      return res.status(400).json({ message: "Counselor is not available at this time" });
    }

    // Logic to save the appointment should go here (this can be saved in an Appointment model)
    // For example, creating a new appointment in a database (you could add an Appointment model).

    res.status(201).json({ message: "Appointment scheduled successfully" });
  } catch (error) {
    console.error("Error scheduling appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
