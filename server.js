const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Allow frontend to access the API
app.use(bodyParser.json());  // Parse incoming JSON requests
app.use(helmet()); // Secure the app by adding HTTP headers
app.use(morgan('dev')); // Log incoming requests
app.use(rateLimit({ // Rate limiting to prevent abuse
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
}));

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const clientRoutes = require('./routes/clientRoutes');
app.use('/api/client', clientRoutes);

const counselorRoutes = require('./routes/CounselorRoutes');
app.use('/api', counselorRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api', appointmentRoutes); // Use /api for appointments-related routes

const chatRoutes = require('./routes/chatRoutes');
app.use('/api', chatRoutes);

const sessionNotesRoutes = require('./routes/SessionNotesRoutes');
app.use('/api', sessionNotesRoutes);

const paymentRoutes = require('./routes/paymentRoutes')
app.use('/api', paymentRoutes)

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Uncaught Exception Handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1); // Exit the process to avoid undefined behavior
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
