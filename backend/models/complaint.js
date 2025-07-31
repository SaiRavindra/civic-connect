// models/Complaint.js
const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    type: String,
    required: true,
  },
  issueType: {
    type: String,
    required: true,
    enum: ['Water', 'Electricity', 'Road', 'Garbage', 'Other'], // example types
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Optional: add only if every complaint must be linked to a user
  },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
