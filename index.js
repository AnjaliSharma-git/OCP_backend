require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => {
  res.send({ message: "Welcome to Online Counseling Platform API!" });
});

// Services Route
app.get("/services", (req, res) => {
  const services = [
    { id: 1, name: "Mental Health Counseling", description: "Address anxiety, depression, and more." },
    { id: 2, name: "Relationship Counseling", description: "Strengthen your relationships." },
    { id: 3, name: "Career Counseling", description: "Make informed career decisions." },
  ];
  res.json(services);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
