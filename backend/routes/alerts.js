// routes/alerts.js
const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

// 🆕 Create a new alert
router.post("/create", async (req, res) => {
  try {
    const { title, message, alertType, location, urgency } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: "Title and message are required." });
    }

    const alert = new Alert({
      title,
      message,
      alertType: alertType || "General",
      location: location || "All",
      urgency: urgency || "Normal",
    });

    await alert.save();
    res.status(201).json({ success: true, message: "✅ Alert created successfully!" });
  } catch (error) {
    console.error("❌ Error creating alert:", error);
    res.status(500).json({ success: false, error: "Failed to create alert." });
  }
});

// 📋 Get all alerts (for admin or users)
router.get("/all", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    console.error("❌ Error fetching alerts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch alerts." });
  }
});

// ❌ Delete an alert by ID (admin use)
router.delete("/:id", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found." });
    }
    res.status(200).json({ success: true, message: "🗑️ Alert deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting alert:", error);
    res.status(500).json({ success: false, error: "Failed to delete alert." });
  }
});

module.exports = router;
