const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth");
const complaintRoutes = require('./routes/complaintRoutes');
const userRoutes = require("./routes/userRoutes");
const insightsRoutes = require('./routes/insightsRoutes');
const alertRoutes = require("./routes/alerts");


const app = express();
const PORT = 5000;


// Middleware
app.use(cors());
app.use(express.json());


// MongoDB connection URI
const MONGO_URL = 'mongodb://127.0.0.1:27017/civicconnect';

// Connect to MongoDB
mongoose.connect(MONGO_URL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});



// Mount routes
app.use("/api/complaints", complaintRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use('/api/insights', insightsRoutes);
app.use("/api/alerts", alertRoutes);


app.get('/', (req, res) => {
  res.send('Backend is running! hello mussi');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
