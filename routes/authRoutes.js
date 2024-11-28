const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Add bcryptjs for password hashing
const Client = require("../models/Client");
const Counselor = require("../models/Counselor");

const router = express.Router();

// Secret key for JWT (store securely in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

/**
 * Reusable function to register a user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {string} role - "client" or "counselor"
 */
const registerUser = async (req, res, role) => {
  const { name, email, password, specialization, experience, availability } = req.body;
  const Model = role === "client" ? Client : Counselor;

  console.log(`Registering ${role}:`, req.body);

  try {
    // Check if the user already exists
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      console.log(`${role} already exists:`, email);
      return res.status(400).json({ message: `${role} already exists` });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds for bcrypt

    // Create new user object with experience and availability if role is counselor
    const newUser = new Model({
      name,
      email,
      password: hashedPassword, // Save the hashed password
      ...(role === "counselor" && { 
        specialization, 
        experience,  // Add experience for counselors
        availability // Add availability for counselors
      }),
    });

    // Save the user to the database
    await newUser.save();

    console.log(`${role} registered successfully:`, newUser);
    res.status(201).json({ message: `${role} registered successfully` });
  } catch (error) {
    console.error(`Error registering ${role}:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Reusable function to log in a user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {string} role - "client" or "counselor"
 */
const loginUser = async (req, res, role) => {
  const { email, password } = req.body;
  const Model = role === "client" ? Client : Counselor;

  console.log(`Logging in ${role}:`, email);

  try {
    // Find the user by email
    const user = await Model.findOne({ email });
    if (!user) {
      console.log(`${role} not found:`, email);
      return res.status(404).json({ message: `${role} not found` });
    }

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password); // Compare with hashed password
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, {
      expiresIn: "1d", // Token expires in 1 day
    });

    console.log(`${role} logged in successfully:`, email);
    res.status(200).json({
      message: `${role} logged in successfully`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ...(role === "counselor" && { 
          specialization: user.specialization,
          experience: user.experience, // Include experience for counselors
          availability: user.availability // Include availability for counselors
        }),
      },
    });
  } catch (error) {
    console.error(`Error logging in ${role}:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

// Routes for registration
router.post("/register-client", (req, res) => {
  registerUser(req, res, "client");
});

router.post("/register-counselor", (req, res) => {
  registerUser(req, res, "counselor");
});

// Routes for login
router.post("/login-client", (req, res) => {
  loginUser(req, res, "client");
});

router.post("/login-counselor", (req, res) => {
  loginUser(req, res, "counselor");
});

module.exports = router;
