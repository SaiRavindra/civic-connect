const express = require('express');
const app = express();
const PORT = 5000;
const Complaint = require('./models/complaint');

app.use(express.json());


const mongoose = require('mongoose');

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

// POST route to receive complaints
app.post('/complaints', async (req, res) => {
  try {
    console.log('Received complaint:', req.body);
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).json({ message: 'Complaint saved successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save complaint' });
  }
});


app.get('/', (req, res) => {
  res.send('Backend is running! hello mussi');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});