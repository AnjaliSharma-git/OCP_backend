const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Allow frontend to access the API
app.use(bodyParser.json());  // Parse incoming JSON requests

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const clientRoutes = require('./routes/clientRoutes');
app.use('/api/client', clientRoutes);

const counselorRoutes = require('./routes/counselorRoutes');
app.use('/api/counselor', counselorRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api', appointmentRoutes); // Use /api for appointments-related routes

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

const sessionNotesRoutes = require('./routes/SessionNotesRoutes');
app.use('/api/session-notes', sessionNotesRoutes);


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
