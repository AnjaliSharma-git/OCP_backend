const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const clientRoutes = require('./routes/clientRoutes');
app.use('/api/client', clientRoutes);

const counselorRoutes = require('./routes/CounselorRoutes');
app.use('/api/counselor', counselorRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes); // Updated to use /api/appointments for appointments

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
