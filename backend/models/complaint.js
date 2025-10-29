const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contact: { type: String, required: true },
  issueType: { 
    type: String, 
    required: true, 
    enum: ['Water', 'Road', 'Electricity', 'Drainage', 'Garbage']  // ✅ Added new complaint types
  },
  description: { type: String, required: true },
  ward: { 
    type: String, 
    required: true, 
    enum: ['Ward 1','Ward 2','Ward 3','Ward 4'] 
  },
  submittedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { 
    type: String, 
    required: true, 
    enum: ['Ramnagar', 'Srinagar'] 
  },
  severity: { type: Number, default: 1 }, // 1..10
  status: { 
    type: String, 
    enum: ['Pending','In Progress','Resolved'], 
    default: 'Pending' 
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
