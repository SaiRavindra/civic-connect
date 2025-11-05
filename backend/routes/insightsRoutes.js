
const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// GET /api/insights/last-30-days
// Example: /insights/last-30-days?location=Ramnagar
router.get('/last-30-days', async (req, res) => {
  try {
    const { location } = req.query;
    const days = parseInt(req.query.days) || 30;
    const limitSamples = parseInt(req.query.limitSamples) || 5;

    const thirtyDaysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // ✅ Build a proper match filter
    const matchFilter = {
      submittedAt: { $gte: thirtyDaysAgo },
    };

    // Add location filter if provided
    if (location) {
      matchFilter.location = location;
    }

    // 🔥 Use the matchFilter inside pipeline
    const pipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: { ward: "$ward", issueType: "$issueType" },
          count: { $sum: 1 },
          avgSeverity: { $avg: "$severity" },
          maxSeverity: { $max: "$severity" },
          severitySum: { $sum: "$severity" },
          sampleComplaints: {
            $push: {
              _id: "$_id",
              description: "$description",
              severity: "$severity",
              submittedAt: "$submittedAt",
              location: "$location",
            },
          },
        },
      },
      { $sort: { "_id.ward": 1, count: -1 } },
      {
        $group: {
          _id: "$_id.ward",
          issues: {
            $push: {
              issueType: "$_id.issueType",
              count: "$count",
              avgSeverity: "$avgSeverity",
              maxSeverity: "$maxSeverity",
              severitySum: "$severitySum",
              sampleComplaints: { $slice: ["$sampleComplaints", limitSamples] },
            },
          },
          totalComplaints: { $sum: "$count" },
          totalSeveritySum: { $sum: "$severitySum" },
        },
      },
      {
        $project: {
          _id: 0,
          ward: "$_id",
          totalComplaints: 1,
          avgSeverityOverall: {
            $cond: [
              { $gt: ["$totalComplaints", 0] },
              { $divide: ["$totalSeveritySum", "$totalComplaints"] },
              0,
            ],
          },
          issues: 1,
        },
      },
      { $sort: { totalComplaints: -1 } },
    ];

    const results = await Complaint.aggregate(pipeline);

    res.json({
      location: location || "All",
      window: { start: thirtyDaysAgo.toISOString(), end: new Date().toISOString() },
      wards: results,
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ error: "Server error generating insights", reason: error.message });
  }
});


// --------------------------------------
// TOP PROBLEM PER WARD
// --------------------------------------
router.get('/top-issues', async (req, res) => {
  try {
    const { location } = req.query;
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const match = { submittedAt: { $gte: since } };
    if (location) match.location = location;

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: { ward: "$ward", issueType: "$issueType" },
          totalComplaints: { $sum: 1 },
          avgSeverity: { $avg: "$severity" },
        },
      },
      { $sort: { "_id.ward": 1, totalComplaints: -1 } },
      {
        $group: {
          _id: "$_id.ward",
          topIssue: { $first: "$_id.issueType" },
          totalComplaints: { $first: "$totalComplaints" },
          avgSeverity: { $first: "$avgSeverity" },
        },
      },
      {
        $project: {
          _id: 0,
          ward: "$_id",
          topIssue: {
            issueType: "$topIssue",
            totalComplaints: "$totalComplaints",
            avgSeverity: "$avgSeverity",
          },
        },
      },
    ];

    const result = await Complaint.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    console.error("Top issues error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------
// SEVERITY VS COMPLAINT VOLUME
// --------------------------------------
router.get('/severity-volume', async (req, res) => {
  try {
    const { location } = req.query;
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const match = { submittedAt: { $gte: since } };
    if (location) match.location = location;

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: "$ward",
          totalComplaints: { $sum: 1 },
          avgSeverity: { $avg: "$severity" },
        },
      },
      {
        $project: {
          _id: 0,
          ward: "$_id",
          totalComplaints: 1,
          avgSeverity: 1,
        },
      },
      { $sort: { totalComplaints: -1 } },
    ];

    const result = await Complaint.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    console.error("Severity-volume error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------
// ISSUE SEVERITY BREAKDOWN
// --------------------------------------
router.get('/severity-breakdown', async (req, res) => {
  try {
    const { location } = req.query;
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const match = { submittedAt: { $gte: since } };
    if (location) match.location = location;

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: { ward: "$ward", issueType: "$issueType" },
          totalComplaints: { $sum: 1 },
          avgSeverity: { $avg: "$severity" },
        },
      },
      {
        $group: {
          _id: "$_id.ward",
          issues: {
            $push: {
              issueType: "$_id.issueType",
              totalComplaints: "$totalComplaints",
              avgSeverity: "$avgSeverity",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          ward: "$_id",
          issues: 1,
        },
      },
      { $sort: { ward: 1 } },
    ];

    const result = await Complaint.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    console.error("Severity breakdown error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------
// SUMMARY CARD (OPTIONAL)
// --------------------------------------
router.get('/summary', async (req, res) => {
  try {
    const { location } = req.query;
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const match = { submittedAt: { $gte: since } };
    if (location) match.location = location;

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: "$ward",
          totalComplaints: { $sum: 1 },
          avgSeverity: { $avg: "$severity" },
        },
      },
      {
        $group: {
          _id: null,
          totalComplaints: { $sum: "$totalComplaints" },
          avgSeverity: { $avg: "$avgSeverity" },
          topWardByCount: { $first: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          totalComplaints: 1,
          avgSeverity: 1,
          topWardByCount: 1,
        },
      },
    ];

    const [result] = await Complaint.aggregate(pipeline);
    res.json(result || { totalComplaints: 0, avgSeverity: 0, topWardByCount: null });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/insights/future-ward-predictions?location=Ramnagar
router.get('/future-ward-predictions', async (req, res) => {
  try {
    const { location } = req.query;

    // Example: naive prediction based on past 30 days avg severity per ward
    const days = 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const match = { submittedAt: { $gte: since } };
    if (location) match.location = location;

    const predictions = await Complaint.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$ward",
          avgSeverity: { $avg: "$severity" },
          totalComplaints: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          ward: "$_id",
          predictedSeverityNextMonth: { $multiply: ["$avgSeverity", 1.05] }, // +5% trend
          predictedComplaintsNextMonth: { $multiply: ["$totalComplaints", 1.1] }, // +10% trend
        },
      },
      { $sort: { predictedSeverityNextMonth: -1 } },
    ]);

    res.json(predictions);
  } catch (err) {
    console.error("Future predictions error:", err);
    res.status(500).json({ error: err.message });
  }
});


// --------------------------------------
// FUTURE PREDICTIONS (ML Integration)
// --------------------------------------
const { getPredictedCounts, getPredictedZones, getTopComplaints } = require('../utils/mlClient');

// Combined future insights from ML microservice
// router.get('/future-predictions', async (req, res) => {
//   try {
//     const { location } = req.query;

//     console.log('🔍 Fetching ML predictions for location:', location);

//     // Fetch from ML service
//     const [counts, zones, topComplaints] = await Promise.all([
//       getPredictedCounts(location),
//       getPredictedZones(location),
//       getTopComplaints(location),
//     ]);

//     res.json({
//       location: location || 'All',
//       counts,
//       zones,
//       topComplaints,
//       generatedAt: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error('❌ Error fetching ML predictions:', err.message);
//     res.status(500).json({ error: 'Failed to fetch ML predictions', reason: err.message });
//   }
// });

router.get('/future-predictions', async (req, res) => {
  try {
    const { location } = req.query;

    console.log('🔍 Fetching ML predictions for location:', location);

    // Fetch predictions from ML microservice
    const [counts, zones, topComplaints, wardTopComplaints] = await Promise.all([
      getPredictedCounts(location),
      getPredictedZones(location),
      getTopComplaints(location),
      // 👇 Fetch the ward-level top complaints
      fetch(`http://127.0.0.1:8001/top-complaints-by-ward?location=${location || ''}`).then(res => res.json())
    ]);

    res.json({
      location: location || 'All',
      counts,
      zones,
      topComplaints,
      wardTopComplaints,  // ✅ Add this
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('❌ Error fetching ML predictions:', err.message);
    res.status(500).json({ error: 'Failed to fetch ML predictions', reason: err.message });
  }
});



module.exports = router;
