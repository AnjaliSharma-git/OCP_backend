const bcrypt = require("bcrypt");
const Counselor = require("../models/Counselor");

exports.registerCounselor = async (req, res) => {
  const { name, email, password, specialization, experience, availability } = req.body;

  if (!name || !email || !password || !specialization || experience == null || !availability) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

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

exports.updateAvailability = async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  if (!id || !availability) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  try {
    const counselor = await Counselor.findById(id);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    if (!Array.isArray(availability) || availability.some((item) => !item.date || !item.startTime || !item.endTime)) {
      return res.status(400).json({ message: "Invalid availability format" });
    }

    counselor.availability = availability;
    await counselor.save();

    res.status(200).json({ message: "Availability updated successfully" });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCounselors = async (req, res) => {
  try {
    const counselors = await Counselor.find();
    res.status(200).json(counselors);
  } catch (error) {
    console.error("Error fetching counselors:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.scheduleAppointment = async (req, res) => {
  const { counselorId, clientId, sessionType, date, time } = req.body;

  if (!counselorId || !clientId || !sessionType || !date || !time) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  try {
    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    if (!Array.isArray(counselor.availability) || counselor.availability.length === 0) {
      return res.status(400).json({ message: "Counselor is not available" });
    }

    const isAvailable = counselor.availability.some(
      (slot) => slot.day === date && slot.startTime <= time && slot.endTime >= time
    );

    if (!isAvailable) {
      return res.status(400).json({ message: "Counselor is not available at this time" });
    }


    res.status(201).json({ message: "Appointment scheduled successfully" });
  } catch (error) {
    console.error("Error scheduling appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
