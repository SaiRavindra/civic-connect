// scripts/seed_complaints.js
const mongoose = require('mongoose');
require('dotenv').config();
const Complaint = require('../models/Complaint');
const { KEYWORD_WEIGHTS, computeSeverity } = require('../utils/severity');

const WARDS = ['Ward 1','Ward 2','Ward 3','Ward 4'];
const ISSUES = ['Water','Road','Electricity'];
const LOCATIONS = ['Ramnagar', 'Srinagar'];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

function randomChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function makeDescription(issueType) {
  const kwList = [...Object.keys(KEYWORD_WEIGHTS.general)];
  const issueKw = Object.keys(KEYWORD_WEIGHTS[issueType.toLowerCase()] || {});
  const chosen = [];
  
  // Determine severity level for this complaint
  const severityType = Math.random();
  
  if (severityType < 0.3) {
    // 30% Low severity complaints
    const lowSeverityPhrases = [
      'minor issue with',
      'small problem regarding',
      'needs attention',
      'please look into',
      'would be nice to fix'
    ];
    chosen.push(randomChoice(lowSeverityPhrases));
    chosen.push(issueType.toLowerCase());
  } 
  else if (severityType < 0.7) {
    // 40% Medium severity
    chosen.push(randomChoice(issueKw || []) || 'issue');
    if (Math.random() < 0.3) chosen.push('please check');
  }
  else {
    // 30% High severity
    chosen.push(randomChoice(issueKw || []) || 'issue');
    chosen.push(randomChoice(kwList));
    if (Math.random() < 0.4) chosen.push('URGENT!');
  }
  
  return chosen.join(' ');
}

async function seed(n = 100) {
  if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in .env');

  // ✅ Connect to MongoDB without deprecated options
  await mongoose.connect(process.env.MONGO_URI);

  const docs = [];
  for (let i = 0; i < n; i++) {
    const issueType = randomChoice(ISSUES);
    const ward = randomChoice(WARDS);
    const description = makeDescription(issueType);
    // Calculate severity score for the complaint
    const severity = computeSeverity(description, issueType);
    const location = randomChoice(LOCATIONS);
    
    const status = randomChoice(STATUSES);
    const submittedAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24*60*60*1000);
    let resolvedAt = null;
    let inProgressAt = null;

    // Set appropriate dates for In Progress and Resolved statuses
    if (status === 'In Progress' || status === 'Resolved') {
      inProgressAt = new Date(submittedAt.getTime() + Math.floor(Math.random() * 3) * 24*60*60*1000);
    }
    if (status === 'Resolved') {
      resolvedAt = new Date(inProgressAt.getTime() + Math.floor(Math.random() * 5) * 24*60*60*1000);
    }

    docs.push({
      name: `Seed User ${i}`,
      contact: `seed+${i}@example.com`,
      issueType,
      description,
      ward,
      location,
      severity,
      status,
      userId: new mongoose.Types.ObjectId(),
      submittedAt,
      inProgressAt,
      resolvedAt
    });
  }

  await Complaint.insertMany(docs);
  console.log(`Inserted ${n} sample complaints`);
  await mongoose.disconnect();
}

seed(300).catch(err => { console.error(err); process.exit(1); });
