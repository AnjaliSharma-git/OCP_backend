const express = require("express");
const jwt = require("jsonwebtoken");
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

const generateToken = (user, role) => {
  if (!user || !role) {
    throw new Error("User and role are required");
  }

  if (!user._id) {
    throw new Error("User object must contain an _id property");
  }

  try {
    return jwt.sign(
      { 
        id: user._id, 
        role,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRY }
    );
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
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (role === "counselor" && (!specialization || experience === undefined)) {
      return res.status(400).json({ 
        message: "Specialization and experience are required for counselors" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    const Model = role === "client" ? Client : Counselor;

    const existingUser = await userExists(email, role);
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ 
        message: `${role} already exists with this email` 
      });
    }
    
    const newUser = new Model({
      name,
      email: email.toLowerCase(),
      password,
      ...(role === "counselor" && { 
        specialization, 
        experience: Number(experience),
        availability: availability || []
      })
    });

    console.log('Saving new user:', { 
      name, 
      email, 
      role,
      ...(role === "counselor" && { specialization, experience })
    });

    const savedUser = await newUser.save();
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
    return res.status(500).json({ 
      message: "Server error while registering user",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const loginUser = async (req, res, role) => {
  const { email, password } = req.body;
  
  try {
    const Model = role === "client" ? Client : Counselor;
    
    console.log('Login attempt:', {
      email: email,
      role: role,
      passwordProvided: !!password
    });

    const user = await Model.findOne({ email: email.toLowerCase() });
    console.log('User search result:', {
      userFound: !!user,
      userEmail: user?.email,
      hasPassword: !!user?.password
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password comparison:', {
      isMatch: isMatch
    });

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
        })
      }
    });
  } catch (error) {
    console.error(`Error logging in ${role}:`, error);
    res.status(500).json({ 
      message: "Server error while logging in",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const verifyUserToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const Model = decoded.role === "client" ? Client : Counselor;
    const user = await Model.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: decoded.role,
        ...(decoded.role === "counselor" && {
          specialization: user.specialization,
          experience: user.experience,
          availability: user.availability
        })
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

router.post("/register-client", (req, res) => registerUser(req, res, "client"));
router.post("/register-counselor", (req, res) => registerUser(req, res, "counselor"));
router.post("/login-client", (req, res) => loginUser(req, res, "client"));
router.post("/login-counselor", (req, res) => loginUser(req, res, "counselor"));
router.get("/verify-token", verifyUserToken);

router.get("/profile", verifyToken, async (req, res) => {
  const { role, id } = req.user;
  const Model = role === "client" ? Client : Counselor;

  try {
    const user = await Model.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

module.exports = router;
