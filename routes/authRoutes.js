const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Client = require("../models/Client");
const Counselor = require("../models/Counselor");
const { verifyToken } = require("../middleware/auth");  // Import the token verification middleware

const router = express.Router();

// Secret key for JWT (store securely in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1d"; // Store expiry in environment variable

// Function to check if the user already exists by email
const userExists = async (email, role) => {
  const Model = role === "client" ? Client : Counselor;
  return await Model.findOne({ email });
};

// Function to hash a password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10); // 10 is the salt rounds for bcrypt
};

// Function to generate a JWT token
const generateToken = (user, role) => {
  return jwt.sign({ id: user._id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY, // Expiry duration can be changed here or via env variable
  });
};

// Reusable function to register a user
const registerUser = async (req, res, role) => {
  const { name, email, password, specialization, experience, availability } = req.body;
  const Model = role === "client" ? Client : Counselor;

  try {
    // Check if the user already exists
    const existingUser = await userExists(email, role);
    if (existingUser) {
      return res.status(400).json({ message: `${role} already exists with this email` });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await hashPassword(password);

    // Create new user object with role-specific fields
    const newUser = new Model({
      name,
      email,
      password: hashedPassword, // Save the hashed password
      ...(role === "counselor" && { 
        specialization, 
        experience, 
        availability 
      }),
    });

    // Save the user to the database
    await newUser.save();
    res.status(201).json({ message: `${role} registered successfully` });
  } catch (error) {
    console.error(`Error registering ${role}:`, error);
    res.status(500).json({ message: "Server error while registering user" });
  }
};

// Reusable function to log in a user
const loginUser = async (req, res, role) => {
  const { email, password } = req.body;
  const Model = role === "client" ? Client : Counselor;

  try {
    // Find the user by email
    const user = await Model.findOne({ email });
    console.log(`Attempting to log in as ${role} with email: ${email}`);

    if (!user) {
      return res.status(404).json({ message: `${role} not found with this email` });
    }

    // Log the found user to check if we have the right data
    console.log(`${role} found:`, user);

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = generateToken(user, role);

    res.status(200).json({
      message: `${role} logged in successfully`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ...(role === "counselor" && { 
          specialization: user.specialization,
          experience: user.experience, 
          availability: user.availability 
        }),
      },
    });
  } catch (error) {
    console.error(`Error logging in ${role}:`, error);
    res.status(500).json({ message: "Server error while logging in user" });
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

// Example of a protected route that needs the JWT token for access
router.get("/profile", verifyToken, async (req, res) => {
  const { role, id } = req.user; // From the decoded JWT
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
        ...(role === "counselor" && { 
          specialization: user.specialization,
          experience: user.experience, 
          availability: user.availability 
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

module.exports = router;
