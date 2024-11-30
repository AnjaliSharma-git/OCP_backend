const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Client = require("../models/Client");
const Counselor = require("../models/Counselor");
const { verifyToken } = require("../middleware/auth");  

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1d"; 
const userExists = async (email, role) => {
  const Model = role === "client" ? Client : Counselor;
  return await Model.findOne({ email });
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10); 
};

const generateToken = (user, role) => {
  return jwt.sign({ id: user._id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY, 
  });
};

const registerUser = async (req, res, role) => {
  const { name, email, password, specialization, experience, availability } = req.body;
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
      ...(role === "counselor" && { 
        specialization, 
        experience, 
        availability 
      }),
    });

    await newUser.save();
    res.status(201).json({ message: `${role} registered successfully` });
  } catch (error) {
    console.error(`Error registering ${role}:`, error);
    res.status(500).json({ message: "Server error while registering user" });
  }
};

const loginUser = async (req, res, role) => {
  const { email, password } = req.body;
  const Model = role === "client" ? Client : Counselor;

  try {
    const user = await Model.findOne({ email });
    console.log(`Attempting to log in as ${role} with email: ${email}`);

    if (!user) {
      return res.status(404).json({ message: `${role} not found with this email` });
    }

    console.log(`${role} found:`, user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

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


router.post("/register-client", (req, res) => {
  registerUser(req, res, "client");
});

router.post("/register-counselor", (req, res) => {
  registerUser(req, res, "counselor");
});

router.post("/login-client", (req, res) => {
  loginUser(req, res, "client");
});

router.post("/login-counselor", (req, res) => {
  loginUser(req, res, "counselor");
});

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
