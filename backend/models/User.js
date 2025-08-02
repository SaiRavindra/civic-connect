const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  complaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
