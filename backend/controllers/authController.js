// backend/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password, username, age, gender, occupation, location, mobile } = req.body;
    
    // Validate required fields
    if (!email || !password || !username || !age || !gender || !occupation || !location || !mobile) {
      return res.status(400).json({ msg: "All required fields must be provided" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        msg: existingUser.email === email ? "Email already registered" : "Username already taken" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      username,
      age,
      gender,
      occupation,
      location,
      mobile,
      past_mental_health_history: req.body.past_mental_health_history || ""
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback-secret-key", { expiresIn: "7d" });

    res.status(201).json({
      msg: "Registration successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ msg: "Registration failed. Please try again." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ msg: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    console.log('Login successful for user:', email);

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback-secret-key", { expiresIn: "7d" });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ msg: "Login failed. Please try again." });
  }
};
