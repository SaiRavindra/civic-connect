// routes/userRoutes.js

const express = require("express");
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const User = require("../models/User");

// ✅ GET /api/profile - fetch logged-in user details
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ name: user.name, email: user.email });
  } catch (err) {
    console.error("❌ Error in /api/profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
