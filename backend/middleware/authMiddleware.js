// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔐 Token received:', token);

  try {
    console.log('🧪 JWT_SECRET loaded:', process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ safer
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT error:', err);
    console.log('🔐 Token received:', token);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
