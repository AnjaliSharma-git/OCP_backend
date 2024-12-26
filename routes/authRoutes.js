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
  if (!email || !role) {
    throw new Error("Email and role are required");
  }

  const Model = role === "client" ? Client : Counselor;
  if (!Model) {
    throw new Error("Invalid role specified");
  }

  try {
    const user = await Model.findOne({ email });
    return user || null;
  } catch (error) {
    console.error("Error finding user:", error);
    throw new Error("Database query failed");
  }
};

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

const generateToken = (user, role) => {
  if (!user || !role) {
    throw new Error("User and role are required");
  }

  if (!user._id) {
    throw new Error("User object must contain an _id property");
  }

  try {
    return jwt.sign({ id: user._id, role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
  } catch (error) {
    console.error("Error generating JWT:", error);
    throw new Error("Generating JWT failed");
  }
};

const registerUser = async (req, res, role) => {
  console.log(`Starting registration for ${role}:`, { 
    body: { ...req.body, password: '[REDACTED]' } 
  });

  const { name, email, password, specialization, experience, availability } = req.body;
  
  try {
    // Validation
    if (!name || !email || !password || (role === "counselor" && (!specialization || experience == null))) {
      console.log('Validation failed:', { name, email, specialization, experience });
      return res.status(400).json({ message: "All required fields must be provided" });
    }
    
    const Model = role === "client" ? Client : Counselor;

    // Check existing user
    const existingUser = await userExists(email, role);
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: `${role} already exists with this email` });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const newUser = new Model({
      name,
      email,
      password: hashedPassword,
      ...(role === "counselor" && { 
        specialization, 
        experience, 
        availability: availability || [] 
      }),
    });

    console.log('Saving new user:', { 
      name, 
      email, 
      role,
      ...(role === "counselor" && { specialization, experience })
    });

    const savedUser = await newUser.save();
    
    // Generate token for immediate login
    const token = generateToken(savedUser, role);
    
    console.log('Registration successful:', { userId: savedUser._id, role });

    return res.status(201).json({ 
      message: `${role} registered successfully`,
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
        ...(role === "counselor" && {
          specialization: savedUser.specialization,
          experience: savedUser.experience,
          availability: savedUser.availability
        })
      }
    });
    
  } catch (error) {
    console.error(`Error registering ${role}:`, error);
    return res.status(500).json({ message: "Server error while registering user" });
  }
};

const loginUser = async (req, res, role) => {
  console.log(`Login attempt for ${role}:`, { 
    email: req.body.email 
  });

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const Model = role === "
