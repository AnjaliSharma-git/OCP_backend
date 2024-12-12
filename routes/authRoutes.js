const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Client = require("../models/Client");
const Counselor = require("../models/Counselor");
const { verifyToken } = require("../middleware/auth");  

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1d";

// Check if user already exists (client/counselor)
const userExists = async (email, role) => {
  if (!email || !role) {
    throw new Error("Email and role are required");
  }

  const Model = role === "client" ? Client : Counselor;
  try {
    const user = await Model.findOne({ email });
    return user || null;
  } catch (error) {
    console.error("Error finding user:", error);
    throw new Error("Database query failed");
  }
};

// Hash user password securely
const hashPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required");
  }
  
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Hashing password failed");
  }
};

// Generate JWT Token for logged-in user
const generateToken = (user, role) => {
  if (!user || !role) {
    throw new Error("User and role are required");
  }

  if (!user._id) {
    throw new Error("User object must contain an _id property");
  }

  try {
    return jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  } catch (error) {
    console.error("Error generating JWT:", error);
    throw new Error("Generating JWT failed");
  }
};

// Register user (client or counselor)
const registerUser = async (req, res, role) => {
  const { name, email, password, specialization, experience, availability } = req.body;

  if (!name || !email || !password || (role === "counselor" && (!specialization || experience == null || !availability))) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  const Model = role === "client" ? Client : Counselor;

  try {
    const existingUser = await userExists(email, role);
    if (existingUser) {
      return res.status(400).json({ message: `${role} already exists with this email` });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new Model({
      name,
      email,
      password: hashedPassword,
      ...(role === "counselor" && { specialization, experience, availability }),
    });

    await newUser.save();
    return res.status(201).json({ message: `${role} registered successfully` });
  } catch (error) {
    console.error(`Error registering ${role}:`, error);
    return res.status(500).json({ message: "Server error while registering user" });
  }
};

// Log in user (client or counselor)
const loginUser = async (req, res, role) => {
  const { email, password } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required" });
  }

  const Model = role === "client" ? Client : Counselor;
  try {
    const user = await Model.findOne({ email }).exec();

    if (!user) {
      return res.status(404).json({ message: `${role} not found with this email` });
    }

    if (!user.password) {
      return res.status(500).json({ message: "User password is missing, contact support" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user, role);
    if (!token) {
      return res.status(500).json({ message: "Token generation failed" });
    }

    res.status(200).json({
      message: `${role} logged in successfully`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ...(role === "counselor" && { specialization: user.specialization, experience: user.experience, availability: user.availability }),
      },
    });
  } catch (error) {
    console.error(`Error logging in ${role}:`, error);
    res.status(500).json({ message: "Server error while logging in user" });
  }
};

// Routes for client and counselor registration/login
router.post("/register-client", (req, res) => registerUser(req, res, "client"));
router.post("/register-counselor", (req, res) => registerUser(req, res, "counselor"));
router.post("/login-client", (req, res) => loginUser(req, res, "client"));
router.post("/login-counselor", (req, res) => loginUser(req, res, "counselor"));

// Route to fetch user profile
router.get("/profile", verifyToken, async (req, res) => {
  const { role, id } = req.user;  // Extract user role and ID from JWT
  const Model = role === "client" ? Client : Counselor;

  try {
    const user = await Model.findById(id);
    if (!user) {
      return res.status(404).json({ message: `${role} not found` });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ...(role === "counselor" && { specialization: user.specialization, experience: user.experience, availability: user.availability }),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

module.exports = router;
