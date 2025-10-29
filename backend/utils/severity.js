// utils/severity.js
// Small keyword → weight dictionary and a deterministic computeSeverity function.
// Tweak keywords/weights later as you collect data.

const KEYWORD_WEIGHTS = {
  general: {
    urgent: 6, immediately: 6, asap: 5, danger: 8, emergency: 9, please: 1
  },
  water: {
    burst: 10, 'major leak': 8, 'no water': 7, flood: 9, contamination: 8, overflow: 7, leak: 6
  },
  road: {
    sinkhole: 10, collapse: 9, 'major pothole': 7, blocked: 5, accident: 8, 'fallen tree': 7, pothole: 5
  },
  electricity: {
    electrocution: 10, fire: 10, sparks: 8, 'no power': 7, 'downed line': 9, 'short circuit': 8, outage: 6
  },
  drainage: {
    clog: 8,
    blockage: 7,
    overflow: 6,
    leak: 5,
    flooding: 8,
    choked: 6,
    smell: 5
  },
  garbage: {
    waste: 7,
    smell: 6,
    uncollected: 8,
    pile: 6,
    litter: 5,
    overflowing: 7,
    stink: 5
  }
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * computeSeverity(description: string, issueType: string) => integer 1..10
 */
function computeSeverity(description = '', issueType = '') {
  const desc = (description || '').toLowerCase();
  let score = 0;

  // check general keywords
  for (const [kw, w] of Object.entries(KEYWORD_WEIGHTS.general)) {
    if (new RegExp('\\b' + escapeRegex(kw) + '\\b', 'i').test(desc)) score += w;
  }

  // issueType-specific keywords (map "Water" -> "water")
  const key = (issueType || '').toLowerCase();
  if (KEYWORD_WEIGHTS[key]) {
    for (const [kw, w] of Object.entries(KEYWORD_WEIGHTS[key])) {
      if (new RegExp('\\b' + escapeRegex(kw) + '\\b', 'i').test(desc)) score += w;
    }
  }

  // punctuation bonuses
  const exclam = (description.match(/!/g) || []).length;
  score += Math.min(exclam, 3) * 1; // up to +3

  // ALL CAPS words (3+ letters) — possible sign of urgency
  const caps = (description.match(/\b[A-Z]{3,}\b/g) || []).length;
  score += Math.min(caps, 3) * 1;

  // Map raw score to a 1..10 scale (tweak thresholds as you gather data)
  if (score >= 20) return 10;
  if (score >= 16) return 9;
  if (score >= 12) return 8;
  if (score >= 9)  return 7;
  if (score >= 6)  return 5;
  if (score >= 3)  return 3;
  return 1;
}

module.exports = { computeSeverity, KEYWORD_WEIGHTS };
