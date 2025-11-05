// // scripts/seed_complaints.js
// const mongoose = require('mongoose');
// require('dotenv').config();
// const Complaint = require('../models/Complaint');
// const { KEYWORD_WEIGHTS, computeSeverity } = require('../utils/severity');

// const WARDS = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'];

// // ✅ Added Drainage and Garbage
// const ISSUES = ['Water', 'Road', 'Electricity', 'Drainage', 'Garbage'];

// const LOCATIONS = ['Ramnagar', 'Srinagar'];
// const STATUSES = ['Pending', 'In Progress', 'Resolved'];

// function randomChoice(arr) {
//   return arr[Math.floor(Math.random() * arr.length)];
// }

// function makeDescription(issueType) {
//   const kwList = [...Object.keys(KEYWORD_WEIGHTS.general)];
//   const issueKw = Object.keys(KEYWORD_WEIGHTS[issueType.toLowerCase()] || {});
//   const chosen = [];

//   // Determine severity level for this complaint
//   const severityType = Math.random();

//   if (severityType < 0.3) {
//     // 30% Low severity complaints
//     const lowSeverityPhrases = [
//       'minor issue with',
//       'small problem regarding',
//       'needs attention',
//       'please look into',
//       'would be nice to fix'
//     ];
//     chosen.push(randomChoice(lowSeverityPhrases));
//     chosen.push(issueType.toLowerCase());
//   } else if (severityType < 0.7) {
//     // 40% Medium severity
//     chosen.push(randomChoice(issueKw || []) || 'issue');
//     if (Math.random() < 0.3) chosen.push('please check');
//   } else {
//     // 30% High severity
//     chosen.push(randomChoice(issueKw || []) || 'issue');
//     chosen.push(randomChoice(kwList));
//     if (Math.random() < 0.4) chosen.push('URGENT!');
//   }

//   return chosen.join(' ');
// }

// async function seed(n = 100) {
//   if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in .env');

//   // ✅ Connect to MongoDB
//   await mongoose.connect(process.env.MONGO_URI);

//   const docs = [];
//   for (let i = 0; i < n; i++) {
//     const issueType = randomChoice(ISSUES);
//     const ward = randomChoice(WARDS);
//     const description = makeDescription(issueType);

//     // Compute severity score
//     const severity = computeSeverity(description, issueType);
//     const location = randomChoice(LOCATIONS);

//     const status = randomChoice(STATUSES);
//     const submittedAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
//     let resolvedAt = null;
//     let inProgressAt = null;

//     if (status === 'In Progress' || status === 'Resolved') {
//       inProgressAt = new Date(submittedAt.getTime() + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000);
//     }
//     if (status === 'Resolved') {
//       resolvedAt = new Date(inProgressAt.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000);
//     }

//     docs.push({
//       name: `Seed User ${i}`,
//       contact: `seed+${i}@example.com`,
//       issueType,
//       description,
//       ward,
//       location,
//       severity,
//       status,
//       userId: new mongoose.Types.ObjectId(),
//       submittedAt,
//       inProgressAt,
//       resolvedAt
//     });
//   }

//   await Complaint.insertMany(docs);
//   console.log(`✅ Inserted ${n} sample complaints with Water, Road, Electricity, Drainage, and Garbage`);
//   await mongoose.disconnect();
// }

// seed(300).catch(err => {
//   console.error(err);
//   process.exit(1);
// });




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

// ✅ Function to create unique random past dates
function getRandomPastDate() {
  const randomDays = Math.floor(Math.random() * 30); // within last 30 days
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

async function seed(n = 100) {
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

    // ✅ Only submittedAt (randomized)
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

    // Small delay to make timestamps vary slightly
    await new Promise(r => setTimeout(r, 5));
  }

  await Complaint.insertMany(docs);
  console.log(`✅ Inserted ${n} sample complaints (with random submittedAt only)`);
  await mongoose.disconnect();
}

seed(300).catch(err => {
  console.error(err);
  process.exit(1);
});
