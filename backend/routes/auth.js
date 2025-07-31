const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

     // ✅ Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    
    // const token = authHeader.split(' ')[1];
    console.log('🔐 Token received:', token);


    res.status(201).json({
    message: "User registered successfully",
    token, // 👈 this is important for storing in AsyncStorage
});

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Step 2: Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Step 3: Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token }); // 🎉 send token to frontend

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
