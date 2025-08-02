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


// Get all complaints for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("📥 Fetching complaints for user:", userId);

    const complaints = await Complaint.find({ userId }).sort({ submittedAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("❌ Failed to fetch user complaints:", err);
    res.status(500).json({ error: 'Failed to fetch complaints', reason: err.message });
  }
});


// GET all complaints (Admin - No token check)
router.get("/all", async (req, res) => {
  try {
    const complaints = await Complaint.find();
    return res.status(200).json(complaints);
  } catch (error) {
    console.error("Error in GET /complaints/all:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT update complaint status (Admin - No token check)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return res.json(updatedComplaint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', reason: err.message });
  }
});



module.exports = router;
