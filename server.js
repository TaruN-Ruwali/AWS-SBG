const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Path to persistent leaderboard data file
const DATA_DIR = path.join(__dirname, 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

// Helper to compute total scores, prompts, efficiency and sort ranks
function computeLeaderboard(teams) {
  const processed = teams.map((team, idx) => {
    const r1Score = Math.min(50, Math.max(0, parseFloat(team.round1?.score) || 0));
    const r1Prompts = Math.max(0, parseInt(team.round1?.prompts, 10) || 0);

    const r2Score = Math.min(50, Math.max(0, parseFloat(team.round2?.score) || 0));
    const r2Prompts = Math.max(0, parseInt(team.round2?.prompts, 10) || 0);

    const r3Score = Math.min(50, Math.max(0, parseFloat(team.round3?.score) || 0));
    const r3Prompts = Math.max(0, parseInt(team.round3?.prompts, 10) || 0);

    const totalScore = Math.round((r1Score + r2Score + r3Score) * 10) / 10;
    const totalPrompts = r1Prompts + r2Prompts + r3Prompts;
    const efficiency = totalPrompts > 0 ? (totalScore / totalPrompts).toFixed(2) : '0.00';

    return {
      id: team.id || idx + 1,
      teamNumber: team.teamNumber || `Team ${String(team.id || idx + 1).padStart(2, '0')}`,
      name: team.name || `Team ${team.id || idx + 1}`,
      project: team.project || 'AI Cloud Project',
      members: team.members || '3 Members',
      round1: {
        score: r1Score,
        prompts: r1Prompts,
        notes: team.round1?.notes || ''
      },
      round2: {
        score: r2Score,
        prompts: r2Prompts,
        notes: team.round2?.notes || ''
      },
      round3: {
        score: r3Score,
        prompts: r3Prompts,
        notes: team.round3?.notes || ''
      },
      totalScore,
      totalPrompts,
      efficiency: parseFloat(efficiency),
      updatedAt: team.updatedAt || new Date().toISOString()
    };
  });

  // Sort: Total Score desc, then Total Prompts asc (efficiency tie breaker), then R3, R2, R1 desc
  processed.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (a.totalPrompts !== b.totalPrompts) return a.totalPrompts - b.totalPrompts;
    if (b.round3.score !== a.round3.score) return b.round3.score - a.round3.score;
    if (b.round2.score !== a.round2.score) return b.round2.score - a.round2.score;
    return b.round1.score - a.round1.score;
  });

  // Assign ranks
  processed.forEach((t, i) => {
    t.rank = i + 1;
  });

  // Calculate statistics
  const totalTeams = processed.length;
  const evaluatedTeams = processed.filter(t => t.totalScore > 0).length;
  const totalScoreSum = processed.reduce((acc, t) => acc + t.totalScore, 0);
  const avgScore = evaluatedTeams > 0 ? (totalScoreSum / evaluatedTeams).toFixed(1) : '0.0';
  const highestScore = processed.length > 0 ? processed[0].totalScore : 0;
  const totalPromptsSum = processed.reduce((acc, t) => acc + t.totalPrompts, 0);

  return {
    teams: processed,
    stats: {
      totalTeams,
      evaluatedTeams,
      avgScore: parseFloat(avgScore),
      highestScore,
      totalPrompts: totalPromptsSum
    }
  };
}

// Helper to read leaderboard from file
function readLeaderboardFile() {
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    // Generate default teams if file doesn't exist
    require('./data/generate_teams.js');
  }
  const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Helper to write leaderboard to file
function writeLeaderboardFile(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/leaderboard — returns evaluated leaderboard with ranks and stats
app.get('/api/leaderboard', (req, res) => {
  try {
    const rawTeams = readLeaderboardFile();
    const result = computeLeaderboard(rawTeams);
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Error reading leaderboard:', err);
    res.status(500).json({ ok: false, error: 'Failed to read leaderboard data.' });
  }
});

// POST /api/leaderboard — update teams or single team
app.post('/api/leaderboard', (req, res) => {
  try {
    let currentTeams = readLeaderboardFile();

    if (Array.isArray(req.body.teams)) {
      // Full batch update (e.g. from table edit or CSV import)
      currentTeams = req.body.teams;
    } else if (req.body.teamId !== undefined) {
      // Single team update
      const targetId = parseInt(req.body.teamId, 10);
      const teamIdx = currentTeams.findIndex(t => t.id === targetId);
      if (teamIdx === -1) {
        return res.status(404).json({ ok: false, error: `Team with ID ${targetId} not found.` });
      }

      const team = currentTeams[teamIdx];
      if (req.body.name) team.name = req.body.name;
      if (req.body.project) team.project = req.body.project;
      if (req.body.members) team.members = req.body.members;

      if (req.body.round1) {
        team.round1 = {
          score: Math.min(50, Math.max(0, parseFloat(req.body.round1.score) || 0)),
          prompts: Math.max(0, parseInt(req.body.round1.prompts, 10) || 0),
          notes: req.body.round1.notes !== undefined ? req.body.round1.notes : (team.round1?.notes || '')
        };
      }
      if (req.body.round2) {
        team.round2 = {
          score: Math.min(50, Math.max(0, parseFloat(req.body.round2.score) || 0)),
          prompts: Math.max(0, parseInt(req.body.round2.prompts, 10) || 0),
          notes: req.body.round2.notes !== undefined ? req.body.round2.notes : (team.round2?.notes || '')
        };
      }
      if (req.body.round3) {
        team.round3 = {
          score: Math.min(50, Math.max(0, parseFloat(req.body.round3.score) || 0)),
          prompts: Math.max(0, parseInt(req.body.round3.prompts, 10) || 0),
          notes: req.body.round3.notes !== undefined ? req.body.round3.notes : (team.round3?.notes || '')
        };
      }

      team.updatedAt = new Date().toISOString();
      currentTeams[teamIdx] = team;
    } else {
      return res.status(400).json({ ok: false, error: 'Provide teams array or teamId with round updates.' });
    }

    // Save to disk
    writeLeaderboardFile(currentTeams);
    const result = computeLeaderboard(currentTeams);
    res.json({ ok: true, message: 'Leaderboard updated successfully!', ...result });
  } catch (err) {
    console.error('Error updating leaderboard:', err);
    res.status(500).json({ ok: false, error: 'Failed to update leaderboard data.' });
  }
});

// POST /api/leaderboard/reset — reset all scores and prompts to 0
app.post('/api/leaderboard/reset', (req, res) => {
  try {
    const currentTeams = readLeaderboardFile();
    const resetTeams = currentTeams.map(t => ({
      ...t,
      round1: { score: 0, prompts: 0, notes: '' },
      round2: { score: 0, prompts: 0, notes: '' },
      round3: { score: 0, prompts: 0, notes: '' },
      totalScore: 0,
      totalPrompts: 0,
      updatedAt: new Date().toISOString()
    }));
    writeLeaderboardFile(resetTeams);
    const result = computeLeaderboard(resetTeams);
    res.json({ ok: true, message: 'Leaderboard scores reset to zero.', ...result });
  } catch (err) {
    console.error('Error resetting leaderboard:', err);
    res.status(500).json({ ok: false, error: 'Failed to reset leaderboard data.' });
  }
});

// POST /api/leaderboard/seed-sample — re-seed demo scores
app.post('/api/leaderboard/seed-sample', (req, res) => {
  try {
    delete require.cache[require.resolve('./data/generate_teams.js')];
    require('./data/generate_teams.js');
    const fresh = readLeaderboardFile();
    const result = computeLeaderboard(fresh);
    res.json({ ok: true, message: 'Sample scores reloaded successfully.', ...result });
  } catch (err) {
    console.error('Error seeding sample scores:', err);
    res.status(500).json({ ok: false, error: 'Failed to seed sample scores.' });
  }
});

// Contact form endpoint — no DB, just validates and echoes success.
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Name, email and message are required.' });
  }

  console.log('New contact submission:', { name, email, subject, message });

  return res.json({ ok: true, message: 'Message received! We typically respond within 1-2 business days.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AWS SBG site running at http://localhost:${PORT}`));