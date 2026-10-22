const fs = require('fs');
const path = require('path');

const teamNames = [
  "Code Smith",
  "404",
  "Cosmic Coders",
  "KC Studio",
  "StormByte",
  "SINISTER 4",
  "Sunflower",
  "Pokemon",
  "TEAM ALGO",
  "1st SEM 4-BACK",
  "Debug Divas",
  "Ghee Khatam",
  "kaju katli",
  "Not Qualified",
  "Onyx",
  "Opus 5.5",
  "Rizz & Deploy",
  "Robo Titans",
  "Team Rio",
  "Tech Tufani",
  "UNDEFINED CORE",
  "ViboRunners",
  "Voyage X",
  "Web warriors",
  "ZyREX",
  "Team V4",
  "Code Crusaders",
  "Codex",
  "Commit & Chill",
  "Debuggers",
  "ECLIPSEEEE",
  "NEXORONS",
  "Straw Hats",
  "Synthron",
  "DEVKRITI INNOVIANS",
  "The Phantoms",
  "Lost Frequency",
  "52",
  "Chupa chups",
  "Team Callidus",
  "Tech4all",
  "Vibecheck 404",
  "Code Maxxing"
];

// Generate teams initialized with 0 marks and 0 prompts ready for live evaluation
const teams = teamNames.map((name, idx) => {
  const id = idx + 1;
  const numStr = String(id).padStart(2, '0');
  return {
    id,
    teamNumber: `Team ${numStr}`,
    name,
    project: `Vibeathon Project ${numStr}`,
    members: `Team Member Roster`,
    round1: { score: 0, prompts: 0, notes: '' },
    round2: { score: 0, prompts: 0, notes: '' },
    round3: { score: 0, prompts: 0, notes: '' },
    totalScore: 0,
    totalPrompts: 0,
    efficiency: 0,
    updatedAt: new Date().toISOString()
  };
});

const outPath = path.join(__dirname, 'leaderboard.json');
fs.writeFileSync(outPath, JSON.stringify(teams, null, 2), 'utf-8');
console.log(`Successfully generated ${teams.length} official teams in ${outPath}`);
