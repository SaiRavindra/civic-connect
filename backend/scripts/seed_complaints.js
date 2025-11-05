// scripts/seed_complaints.js
const mongoose = require('mongoose');
require('dotenv').config();
const Complaint = require('../models/Complaint');
const { KEYWORD_WEIGHTS, computeSeverity } = require('../utils/severity');

const WARDS = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'];
const ISSUES = ['Water', 'Road', 'Electricity', 'Drainage', 'Garbage'];
const LOCATIONS = ['Ramnagar', 'Srinagar'];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

// Helper to pick a random element
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ✅ Generate random past date within the last 120 days (≈4 months)
function getRandomPastDate() {
  const randomDays = Math.floor(Math.random() * 120); // spread across 4 months
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  const randomSeconds = Math.floor(Math.random() * 60);

  return new Date(
    Date.now() -
      (randomDays * 24 * 60 * 60 * 1000 +
       randomHours * 60 * 60 * 1000 +
       randomMinutes * 60 * 1000 +
       randomSeconds * 1000)
  );
}

// Helper to create realistic descriptions with random severity keywords
function makeDescription(issueType) {
  const kwList = [...Object.keys(KEYWORD_WEIGHTS.general)];
  const issueKw = Object.keys(KEYWORD_WEIGHTS[issueType.toLowerCase()] || {});
  const chosen = [];

  const severityType = Math.random();

  if (severityType < 0.3) {
    const lowSeverityPhrases = [
      'minor issue with',
      'small problem regarding',
      'needs attention',
      'please look into',
      'would be nice to fix'
    ];
    chosen.push(randomChoice(lowSeverityPhrases));
    chosen.push(issueType.toLowerCase());
  } else if (severityType < 0.7) {
    chosen.push(randomChoice(issueKw || []) || 'issue');
    if (Math.random() < 0.3) chosen.push('please check');
  } else {
    chosen.push(randomChoice(issueKw || []) || 'issue');
    chosen.push(randomChoice(kwList));
    if (Math.random() < 0.4) chosen.push('URGENT!');
  }

  return chosen.join(' ');
}

async function seed(n = 1200) { // ✅ Default = 1200 complaints
  if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in .env');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const docs = [];

  for (let i = 0; i < n; i++) {
    const issueType = randomChoice(ISSUES);
    const ward = randomChoice(WARDS);
    const description = makeDescription(issueType);
    const severity = computeSeverity(description, issueType);
    const location = randomChoice(LOCATIONS);
    const status = randomChoice(STATUSES);
    const submittedAt = getRandomPastDate();

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
    });

    // Tiny delay to vary timestamps slightly
    if (i % 50 === 0) await new Promise(r => setTimeout(r, 10));
  }

  await Complaint.insertMany(docs);
  console.log(`✅ Inserted ${n} sample complaints spread over the last 4 months`);
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
}

// Run the seeder
seed(1200).catch(err => {
  console.error(err);
  process.exit(1);
});
