// utils/mlClient.js
const axios = require('axios');

// ML service base URL
const ML_BASE = process.env.ML_BASE || 'http://127.0.0.1:8001';

// 🔹 Fetch predicted complaint counts (Linear Regression)
async function getPredictedCounts(location) {
  const res = await axios.get(`${ML_BASE}/predict-counts`, { params: { location } });
  return res.data;
}

// 🔹 Fetch predicted severity zones (Random Forest)
async function getPredictedZones(location) {
  const res = await axios.get(`${ML_BASE}/predict-zones`, { params: { location } });
  return res.data;
}

// 🔹 Fetch top complaint types
async function getTopComplaints(location) {
  const res = await axios.get(`${ML_BASE}/top-complaints`, { params: { location } });
  return res.data;
}

module.exports = { getPredictedCounts, getPredictedZones, getTopComplaints };
