// routes/insights.js
const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

router.get('/last-30-days', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);

    const pipeline = [
      { $match: { submittedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { ward: "$ward", issueType: "$issueType" },
          count: { $sum: 1 },
          avgSeverity: { $avg: "$severity" },
          maxSeverity: { $max: "$severity" },
          severitySum: { $sum: "$severity" },
          sampleComplaints: { $push: { _id: "$_id", description: "$description", severity: "$severity", submittedAt: "$submittedAt" } }
        }
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
              sampleComplaints: "$sampleComplaints"
            }
          },
          totalComplaints: { $sum: "$count" },
          totalSeveritySum: { $sum: "$severitySum" }
        }
      },
      {
        $project: {
          _id: 0,
          ward: "$_id",
          totalComplaints: 1,
          avgSeverityOverall: {
            $cond: [{ $gt: ["$totalComplaints", 0] }, { $divide: ["$totalSeveritySum", "$totalComplaints"] }, 0]
          },
          issues: 1
        }
      },
      { $sort: { totalComplaints: -1 } }
    ];

    const results = await Complaint.aggregate(pipeline);
    res.json({
      window: { start: thirtyDaysAgo.toISOString(), end: new Date().toISOString() },
      wards: results
    });
  } catch (err) {
    console.error('Insights error', err);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

module.exports = router;
