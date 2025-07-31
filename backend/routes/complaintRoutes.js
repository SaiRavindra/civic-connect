// routes/complaintRoutes.js

const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const authMiddleware = require('../middleware/authMiddleware');

// POST route to submit a complaint
router.post('/',authMiddleware, async (req, res) => {
  try {
    console.log("📌 Authenticated user:", req.user);

    console.log("✅ complaint route hit"); // 🔍 Add this to check route is hit
    const { name, contact, issueType, description, location } = req.body;

    const complaint = new Complaint({
      name,
      contact,
      issueType,
      description,
      location,
      userId: req.user._id  // <-- Use user from auth middleware
    });
    console.log("📝 Complaint to save:", complaint);
    await complaint.save();
    res.status(201).json({ message: 'Complaint saved successfully!' });
  } catch (err) {
  console.error('Error while saving complaint:', err); // <- log real reason
  res.status(500).json({ error: 'Failed to save complaint', reason: err.message });
  }
});


// Get all complaints
router.get('/', async (req, res) => {
  const complaints = await Complaint.find();
  res.json(complaints);
});

module.exports = router;
