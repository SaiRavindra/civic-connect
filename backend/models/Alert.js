// models/Alert.js
const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    alertType: {
      type: String,
      enum: ["Water", "Electricity", "Road", "Garbage", "Drainage", "General"],
      default: "General",
    },
    location: { type: String, default: "All" },
    urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", AlertSchema);
