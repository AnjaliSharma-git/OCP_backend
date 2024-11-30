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

app.use(cors({ origin: 'https://online-counseling-platform.netlify.app/' })); 
app.use(bodyParser.json());  
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
}));

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const clientRoutes = require('./routes/ClientRoutes');
app.use('/api/client', clientRoutes);

const counselorRoutes = require('./routes/CounselorRoutes');
app.use('/api', counselorRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api', appointmentRoutes); 

const chatRoutes = require('./routes/chatRoutes');
app.use('/api', chatRoutes);

const sessionNotesRoutes = require('./routes/SessionNotesRoutes');
app.use('/api', sessionNotesRoutes);

const paymentRoutes = require('./routes/paymentRoutes')
app.use('/api', paymentRoutes)

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1); 
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
