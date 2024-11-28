const mongoose = require("mongoose");

const counselorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true }, // Ensure this is marked as required
  availability: [{ day: String, startTime: String, endTime: String }]
});


module.exports = mongoose.model("Counselor", counselorSchema);
