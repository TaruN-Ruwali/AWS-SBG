/**
 * AWS SBG Vibeathon 2026 - Smart Board Fullscreen Leaderboard
 * Displays Rank, Team Name, Points, and No. of Prompts.
 * Ranking logic: Highest Points first. If points are equal, team with fewer prompts ranks higher.
 */

const OFFICIAL_TEAM_NAMES = [
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
  "Tech4all"
];

// Fallback initial team definitions
const DEFAULT_TEAMS_FALLBACK = OFFICIAL_TEAM_NAMES.map((name, idx) => ({
  id: idx + 1,
  teamNumber: `Team ${String(idx + 1).padStart(2, '0')}`,
  name,
  project: `Vibeathon Project ${String(idx + 1).padStart(2, '0')}`,
  members: "Team Member Roster",
  round1: { score: 0, prompts: 0, notes: '' },
  round2: { score: 0, prompts: 0, notes: '' },
  round3: { score: 0, prompts: 0, notes: '' },
  totalScore: 0,
  totalPrompts: 0,
  efficiency: 0
}));

const ADMIN_PIN = "784567";

// Supabase Configuration
const SUPABASE_URL = 'https://mmghawuhglphmwxjetef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZ2hhd3VoZ2xwaG13eGpldGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODg3NzksImV4cCI6MjEwODI2NDc3OX0.B-P2QmYAndACSCWaHe_4_H3bUuJItEjJ_wjcuLtxebw';

let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Supabase initialization failed:', err);
  }
}

// Map Supabase DB row to internal Team object
function mapSupabaseRowToTeam(row) {
  return {
    id: row.id,
    teamNumber: row.team_number || `Team ${String(row.id).padStart(2, '0')}`,
    name: row.name || `Team ${row.id}`,
    project: row.project || '',
    members: row.members || '',
    round1: row.round1 || { score: 0, prompts: 0, notes: '' },
    round2: row.round2 || { score: 0, prompts: 0, notes: '' },
    round3: row.round3 || { score: 0, prompts: 0, notes: '' },
    totalScore: parseFloat(row.total_score) || 0,
    totalPrompts: parseInt(row.total_prompts, 10) || 0,
    efficiency: parseFloat(row.efficiency) || 0,
    updatedAt: row.updated_at
  };
}

// Map internal Team object to Supabase DB row
function mapTeamToSupabaseRow(t) {
  return {
    id: t.id,
    team_number: t.teamNumber,
    name: t.name,
    project: t.project || '',
    members: t.members || '',
    round1: t.round1 || { score: 0, prompts: 0, notes: '' },
    round2: t.round2 || { score: 0, prompts: 0, notes: '' },
    round3: t.round3 || { score: 0, prompts: 0, notes: '' },
    total_score: t.totalScore || 0,
    total_prompts: t.totalPrompts || 0,
    efficiency: t.efficiency || 0,
    updated_at: new Date().toISOString()
  };
}

let allTeams = [];
let currentEvaluatingTeamId = 1;
let isAutoScrollActive = false;
let autoScrollTimer = null;
let pollTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initLeaderboard();
  bindSmartboardControls();
  initRealtimeSync();
});

// Security PIN verification modal helper
function requestAdminPin(actionCallback) {
  const modal = document.getElementById('pin-modal');
  const input = document.getElementById('pin-code-input');
  const errorMsg = document.getElementById('pin-error-msg');
  const submitBtn = document.getElementById('pin-submit-btn');
  const cancelBtn = document.getElementById('pin-cancel-btn');
  const closeBtn = document.getElementById('pin-close-btn');

  if (!modal || !input) {
    const entered = prompt('Enter Security PIN (6 digits):');
    if (entered === ADMIN_PIN) {
      actionCallback();
    } else if (entered !== null) {
      showToast('Incorrect PIN code. Access denied.', 'error');
    }
    return;
  }

  input.value = '';
  if (errorMsg) errorMsg.style.display = 'none';
  modal.classList.add('active');
  setTimeout(() => input.focus(), 100);

  const closeModal = () => {
    modal.classList.remove('active');
    if (submitBtn) submitBtn.onclick = null;
    if (cancelBtn) cancelBtn.onclick = null;
    if (closeBtn) closeBtn.onclick = null;
    input.onkeydown = null;
  };

  const handleVerify = () => {
    const val = input.value.trim();
    if (val === ADMIN_PIN) {
      closeModal();
      actionCallback();
    } else {
      if (errorMsg) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Incorrect PIN code. Access denied.';
      }
      input.classList.add('pin-shake');
      setTimeout(() => input.classList.remove('pin-shake'), 450);
      input.value = '';
      input.focus();
    }
  };

  if (submitBtn) submitBtn.onclick = handleVerify;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  if (closeBtn) closeBtn.onclick = closeModal;
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  };
}

// Toast notification helper (no emojis)
function showToast(message, type = 'success') {
  let toast = document.getElementById('leaderboard-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'leaderboard-toast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${message}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Compute client-side properties and sort strictly according to rule:
// 1. Total Points (Score) DESCENDING
// 2. If points same: LESS Prompts ASCENDING (fewer prompts ranks higher)
function processTeamsData(teams) {
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
      project: team.project || `Vibeathon Project`,
      members: team.members || 'Team Members',
      round1: { score: r1Score, prompts: r1Prompts, notes: team.round1?.notes || '' },
      round2: { score: r2Score, prompts: r2Prompts, notes: team.round2?.notes || '' },
      round3: { score: r3Score, prompts: r3Prompts, notes: team.round3?.notes || '' },
      totalScore,
      totalPrompts,
      efficiency: parseFloat(efficiency)
    };
  });

  // Strict sorting rule:
  // Points DESC, then Prompts ASC (less prompts = higher rank), then ID ASC
  processed.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (a.totalPrompts !== b.totalPrompts) {
      return a.totalPrompts - b.totalPrompts;
    }
    return a.id - b.id;
  });

  // Assign Places (1., 2., 3., ...)
  processed.forEach((t, i) => {
    t.rank = i + 1;
  });

  return processed;
}

// Fetch from Supabase, API, or localStorage fallback
async function initLeaderboard() {
  // 1. Try Supabase first (works on Vercel across all devices anywhere)
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('leaderboard')
        .select('*')
        .order('id', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        allTeams = processTeamsData(data.map(mapSupabaseRowToTeam));
        localStorage.setItem('sbg_vibeathon_teams_v2', JSON.stringify(allTeams));
        renderBoardRows();
        populateModalPicker();
        return;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, trying local fallback:', err);
    }
  }

  // 2. Try local Node.js server (when running npm start locally)
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.teams) && data.teams.length > 0) {
        allTeams = processTeamsData(data.teams);
        localStorage.setItem('sbg_vibeathon_teams_v2', JSON.stringify(allTeams));
        renderBoardRows();
        populateModalPicker();
        return;
      }
    }
  } catch (err) {
    console.warn('API fetch failed, falling back to local storage:', err);
  }

  // 3. LocalStorage check
  const cached = localStorage.getItem('sbg_vibeathon_teams_v2');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name === "Code Smith") {
        allTeams = processTeamsData(parsed);
        renderBoardRows();
        populateModalPicker();
        return;
      }
    } catch (e) {
      console.error('Error parsing cached teams:', e);
    }
  }

  // 4. Initialize with official default teams
  allTeams = processTeamsData(DEFAULT_TEAMS_FALLBACK);
  localStorage.setItem('sbg_vibeathon_teams_v2', JSON.stringify(allTeams));
  renderBoardRows();
  populateModalPicker();
}

// Save teams to Supabase, server API, and localStorage
async function saveTeams(updatedTeams) {
  allTeams = processTeamsData(updatedTeams);
  localStorage.setItem('sbg_vibeathon_teams_v2', JSON.stringify(allTeams));

  // 1. Sync to Supabase (instantly updates database for every device)
  if (supabaseClient) {
    try {
      const rows = allTeams.map(mapTeamToSupabaseRow);
      const { error } = await supabaseClient.from('leaderboard').upsert(rows);
      if (error) {
        console.error('Supabase upsert error:', error);
      }
    } catch (err) {
      console.warn('Failed to sync to Supabase:', err);
    }
  }

  // 2. Sync to local Express server if running locally
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams: allTeams })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.teams) {
        allTeams = processTeamsData(data.teams);
      }
    }
  } catch (err) {
    // Offline or deployed on Vercel static
  }

  renderBoardRows();
}

// Render the clean smart board cards matching the image
function renderBoardRows() {
  const container = document.getElementById('board-rows-container');
  if (!container) return;

  if (allTeams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px; color: var(--ink-muted); font-size: 18px;">
        Loading official teams...
      </div>
    `;
    return;
  }

  container.innerHTML = allTeams.map(team => {
    // Generate clean avatar initial (no emojis)
    const initial = getTeamInitial(team.name);

    // Rank class for podium
    let rankClass = '';
    if (team.rank === 1) {
      rankClass = 'rank-1';
    } else if (team.rank === 2) {
      rankClass = 'rank-2';
    } else if (team.rank === 3) {
      rankClass = 'rank-3';
    }

    // Rank badge in blue matching website theme (no emojis)
    const placeDisplay = `<span class="board-rank-badge">${team.rank}</span>`;

    // Prompt Warning Signs placed in between rank and team name:
    // > 40 prompts: red warning sign
    // > 30 prompts: yellow/amber triangle warning
    let warningBadge = '';
    if (team.totalPrompts > 40) {
      warningBadge = `
        <span class="prompt-warning-badge badge-danger" title="Critical: Exceeded 40 prompts (${team.totalPrompts} used)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/>
          </svg>
        </span>
      `;
    } else if (team.totalPrompts > 30) {
      warningBadge = `
        <span class="prompt-warning-badge badge-warning" title="Warning: Exceeded 30 prompts (${team.totalPrompts} used)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        </span>
      `;
    }

    return `
      <div class="board-team-row ${rankClass}" onclick="handleRowClick(${team.id})" title="Click to view or edit scores for ${escapeHtml(team.name)}">
        <div class="board-place">${placeDisplay}${warningBadge}</div>
        <div class="board-team-info">
          <div class="board-avatar">${initial}</div>
          <div class="board-team-name">${escapeHtml(team.name)}</div>
        </div>
        <div class="board-points">${team.totalScore}</div>
        <div class="board-prompts">${team.totalPrompts}</div>
      </div>
    `;
  }).join('');
}

// Row click handler: protected by PIN in normal mode; inactive in fullscreen mode
window.handleRowClick = function(teamId) {
  if (document.body.classList.contains('fullscreen-active') || document.fullscreenElement) {
    return; // Avoid accidental dialog popups during smart board fullscreen presentation
  }
  requestAdminPin(() => {
    openEvaluationModal(teamId);
  });
};

// Extract a clean 1-2 char alphabetic initial (strictly no emojis)
function getTeamInitial(name) {
  if (!name) return 'TM';
  const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2).toUpperCase();
  }
  return cleaned.toUpperCase() || 'TM';
}

// Populate the team picker inside the Evaluation Modal
function populateModalPicker() {
  const picker = document.getElementById('modal-team-picker');
  if (!picker) return;

  // Preserve selected ID if any
  const selectedVal = currentEvaluatingTeamId || allTeams[0]?.id || 1;
  picker.innerHTML = allTeams.map(t => `
    <option value="${t.id}" ${t.id === selectedVal ? 'selected' : ''}>
      #${t.rank} • ${t.teamNumber} — ${escapeHtml(t.name)} (${t.totalScore} pts, ${t.totalPrompts} prompts)
    </option>
  `).join('');

  picker.onchange = (e) => {
    openEvaluationModal(parseInt(e.target.value, 10));
  };
}

// Open Evaluation Modal for a specific team
window.openEvaluationModal = function(teamId) {
  const team = allTeams.find(t => t.id === teamId);
  if (!team) return;

  currentEvaluatingTeamId = teamId;

  document.getElementById('modal-team-title').textContent = `${team.teamNumber}: ${team.name}`;
  document.getElementById('modal-team-sub').textContent = `Current Place: #${team.rank} • Total Points: ${team.totalScore} • Prompts: ${team.totalPrompts}`;

  const picker = document.getElementById('modal-team-picker');
  if (picker) picker.value = teamId;

  // Round 1
  const r1Score = team.round1?.score || 0;
  document.getElementById('modal-r1-score').value = r1Score;
  document.getElementById('modal-r1-slider').value = r1Score;
  document.getElementById('modal-r1-prompts').value = team.round1?.prompts || 0;

  // Round 2
  const r2Score = team.round2?.score || 0;
  document.getElementById('modal-r2-score').value = r2Score;
  document.getElementById('modal-r2-slider').value = r2Score;
  document.getElementById('modal-r2-prompts').value = team.round2?.prompts || 0;

  // Round 3
  const r3Score = team.round3?.score || 0;
  document.getElementById('modal-r3-score').value = r3Score;
  document.getElementById('modal-r3-slider').value = r3Score;
  document.getElementById('modal-r3-prompts').value = team.round3?.prompts || 0;

  updateModalLiveSummary();

  const modal = document.getElementById('evaluation-modal');
  if (modal) modal.classList.add('active');
};

// Close Evaluation Modal
function closeEvaluationModal() {
  const modal = document.getElementById('evaluation-modal');
  if (modal) modal.classList.remove('active');
}

// Modal score sliders sync
function setupModalScoreSync(roundNum) {
  const slider = document.getElementById(`modal-r${roundNum}-slider`);
  const numBox = document.getElementById(`modal-r${roundNum}-score`);
  const promptBox = document.getElementById(`modal-r${roundNum}-prompts`);

  if (!slider || !numBox) return;

  slider.addEventListener('input', () => {
    numBox.value = slider.value;
    updateModalLiveSummary();
  });

  numBox.addEventListener('input', () => {
    let val = Math.min(50, Math.max(0, parseFloat(numBox.value) || 0));
    slider.value = val;
    updateModalLiveSummary();
  });

  if (promptBox) {
    promptBox.addEventListener('input', () => {
      updateModalLiveSummary();
    });
  }
}

// Live calculation preview in modal
function updateModalLiveSummary() {
  const s1 = parseFloat(document.getElementById('modal-r1-score')?.value) || 0;
  const s2 = parseFloat(document.getElementById('modal-r2-score')?.value) || 0;
  const s3 = parseFloat(document.getElementById('modal-r3-score')?.value) || 0;

  const p1 = parseInt(document.getElementById('modal-r1-prompts')?.value, 10) || 0;
  const p2 = parseInt(document.getElementById('modal-r2-prompts')?.value, 10) || 0;
  const p3 = parseInt(document.getElementById('modal-r3-prompts')?.value, 10) || 0;

  const totalScore = Math.round((s1 + s2 + s3) * 10) / 10;
  const totalPrompts = p1 + p2 + p3;
  const efficiency = totalPrompts > 0 ? (totalScore / totalPrompts).toFixed(2) : '0.00';

  const sumTotalEl = document.getElementById('modal-preview-total');
  const sumPromptsEl = document.getElementById('modal-preview-prompts');
  const sumEffEl = document.getElementById('modal-preview-eff');

  if (sumTotalEl) sumTotalEl.textContent = `${totalScore} / 150`;
  if (sumPromptsEl) sumPromptsEl.textContent = `${totalPrompts}`;
  if (sumEffEl) sumEffEl.textContent = `${efficiency} pts/p`;
}

// Save Modal Evaluation
async function saveModalEvaluation() {
  if (!currentEvaluatingTeamId) return;

  const team = allTeams.find(t => t.id === currentEvaluatingTeamId);
  if (!team) return;

  const r1Score = Math.min(50, Math.max(0, parseFloat(document.getElementById('modal-r1-score').value) || 0));
  const r1Prompts = Math.max(0, parseInt(document.getElementById('modal-r1-prompts').value, 10) || 0);

  const r2Score = Math.min(50, Math.max(0, parseFloat(document.getElementById('modal-r2-score').value) || 0));
  const r2Prompts = Math.max(0, parseInt(document.getElementById('modal-r2-prompts').value, 10) || 0);

  const r3Score = Math.min(50, Math.max(0, parseFloat(document.getElementById('modal-r3-score').value) || 0));
  const r3Prompts = Math.max(0, parseInt(document.getElementById('modal-r3-prompts').value, 10) || 0);

  team.round1 = { score: r1Score, prompts: r1Prompts, notes: '' };
  team.round2 = { score: r2Score, prompts: r2Prompts, notes: '' };
  team.round3 = { score: r3Score, prompts: r3Prompts, notes: '' };

  closeEvaluationModal();
  await saveTeams(allTeams);
  populateModalPicker();
  showToast(`Updated ${team.name}: ${team.totalScore} Points • ${team.totalPrompts} Prompts`);
}

// Toggle Full Screen
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Error attempting fullscreen:', err);
    });
    document.body.classList.add('fullscreen-active');
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    document.body.classList.remove('fullscreen-active');
  }
}

// Listen to fullscreen changes (e.g. user pressed Escape or clicked Exit)
document.addEventListener('fullscreenchange', () => {
  const isFull = !!document.fullscreenElement;
  document.body.classList.toggle('fullscreen-active', isFull);
  const btn = document.getElementById('btn-fullscreen-toggle');
  if (btn) {
    btn.innerHTML = isFull ? 'Exit Fullscreen' : 'Full Screen';
  }
});

// Toggle Smooth Auto-Scroll for Smart Board presentation
function toggleAutoScroll() {
  isAutoScrollActive = !isAutoScrollActive;
  const btn = document.getElementById('btn-toggle-autoscroll');
  const indicator = document.getElementById('autoscroll-indicator');

  if (btn) btn.classList.toggle('active', isAutoScrollActive);
  if (indicator) indicator.style.display = isAutoScrollActive ? 'inline-flex' : 'none';

  if (isAutoScrollActive) {
    startAutoScroll();
    showToast('Auto-Scroll started: scrolling continuously through all teams.');
  } else {
    stopAutoScroll();
    showToast('Auto-Scroll paused.');
  }
}

// Auto Scroll Feature:
// Continuously scrolls down through all teams.
// When reaching the bottom (showing the last team), it pauses for 5 seconds (5000ms).
// Then smoothly returns to the top, pauses briefly, and repeats.
function startAutoScroll() {
  stopAutoScroll();
  let state = 'scrolling_down'; // 'scrolling_down' | 'pausing_at_bottom' | 'scrolling_up' | 'pausing_at_top'
  let pauseUntil = 0;

  autoScrollTimer = setInterval(() => {
    if (!isAutoScrollActive) return;
    const now = Date.now();
    if (now < pauseUntil) return;

    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      document.body.scrollHeight - window.innerHeight
    );
    if (maxScroll <= 0) return;

    const current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

    if (state === 'scrolling_down') {
      if (current >= maxScroll - 6) {
        // Reached bottom, show last team for 5 seconds (5000ms) as specified
        state = 'pausing_at_bottom';
        pauseUntil = now + 5000;
      } else {
        window.scrollBy({ top: 1, behavior: 'auto' });
      }
    } else if (state === 'pausing_at_bottom') {
      // 5 seconds elapsed showing last team! Now return to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      state = 'pausing_at_top';
      pauseUntil = now + 3500; // Allow smooth scroll to finish + brief pause at top to see rank 1
    } else if (state === 'pausing_at_top') {
      // Resume scrolling down
      state = 'scrolling_down';
    }
  }, 28);
}

function stopAutoScroll() {
  if (autoScrollTimer) {
    clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }
}

// Realtime sync across all devices via Supabase and SSE
function initRealtimeSync() {
  // 1. Supabase Realtime Channel (Instant push across all devices on Vercel)
  if (supabaseClient) {
    try {
      supabaseClient
        .channel('public:leaderboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, async () => {
          // Avoid interrupting evaluator typing if modal is open
          const modal = document.getElementById('evaluation-modal');
          const pinModal = document.getElementById('pin-modal');
          if ((modal && modal.classList.contains('active')) || (pinModal && pinModal.classList.contains('active'))) return;

          const { data, error } = await supabaseClient
            .from('leaderboard')
            .select('*')
            .order('id', { ascending: true });

          if (!error && Array.isArray(data) && data.length > 0) {
            allTeams = processTeamsData(data.map(mapSupabaseRowToTeam));
            localStorage.setItem('sbg_vibeathon_teams_v2', JSON.stringify(allTeams));
            renderBoardRows();
            populateModalPicker();
          }
        })
        .subscribe((status) => {
          console.log('📡 Supabase Realtime channel status:', status);
        });
    } catch (err) {
      console.warn('Supabase Realtime not initialized:', err);
    }
  }

  // 2. Local Node.js SSE connection fallback (for local development)
  if (window.EventSource) {
    try {
      const sse = new EventSource('/api/leaderboard/stream');

      sse.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && Array.isArray(data.teams) && data.teams.length > 0) {
            const fresh = processTeamsData(data.teams);
            const modal = document.getElementById('evaluation-modal');
            const isEditing = modal && modal.classList.contains('active');

            allTeams = fresh;
            localStorage.setItem('sbg_vibeathon_teams_v2', JSON.stringify(allTeams));
            renderBoardRows();
            if (!isEditing) {
              populateModalPicker();
            }
          }
        } catch (err) {
          console.error('Error handling realtime event:', err);
        }
      };

      sse.onerror = () => {
        // SSE disconnected or on Vercel; browser/polling will handle it
      };
    } catch (err) {
      // ignore
    }
  }

  // 3. Fallback polling every 3.5 seconds to guarantee 100% sync
  startLivePolling();
}

// Background polling as rock-solid backup
function startLivePolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    // Only poll if modal is not currently open so user's active inputs aren't disrupted
    const modal = document.getElementById('evaluation-modal');
    const pinModal = document.getElementById('pin-modal');
    if ((modal && modal.classList.contains('active')) || (pinModal && pinModal.classList.contains('active'))) return;

    // Check Supabase first
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('leaderboard')
          .select('*')
          .order('id', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          const fresh = processTeamsData(data.map(mapSupabaseRowToTeam));
          const changed = JSON.stringify(fresh.map(t => ({ id: t.id, s: t.totalScore, p: t.totalPrompts, r: t.rank }))) !==
                          JSON.stringify(allTeams.map(t => ({ id: t.id, s: t.totalScore, p: t.totalPrompts, r: t.rank })));
          if (changed) {
            allTeams = fresh;
            localStorage.setItem('sbg_vibeathon_teams_v2', JSON.stringify(allTeams));
            renderBoardRows();
            populateModalPicker();
          }
          return;
        }
      } catch (e) {
        // Continue to local API fallback
      }
    }

    // Check local API
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.teams)) {
          const fresh = processTeamsData(data.teams);
          const changed = JSON.stringify(fresh.map(t => ({ id: t.id, s: t.totalScore, p: t.totalPrompts, r: t.rank }))) !==
                          JSON.stringify(allTeams.map(t => ({ id: t.id, s: t.totalScore, p: t.totalPrompts, r: t.rank })));
          if (changed) {
            allTeams = fresh;
            localStorage.setItem('sbg_vibeathon_teams_v2', JSON.stringify(allTeams));
            renderBoardRows();
            populateModalPicker();
          }
        }
      }
    } catch (e) {
      // Silently ignore polling network errors
    }
  }, 3500);
}

// Bind all controls
function bindSmartboardControls() {
  setupModalScoreSync(1);
  setupModalScoreSync(2);
  setupModalScoreSync(3);

  // Full Screen Button
  document.getElementById('btn-fullscreen-toggle')?.addEventListener('click', toggleFullScreen);

  // Floating Exit Fullscreen Button
  document.getElementById('btn-fullscreen-exit')?.addEventListener('click', toggleFullScreen);

  // Auto Scroll Button
  document.getElementById('btn-toggle-autoscroll')?.addEventListener('click', toggleAutoScroll);

  // Enter Marks Button (PIN Protected: 784567)
  document.getElementById('btn-enter-marks')?.addEventListener('click', () => {
    requestAdminPin(() => {
      openEvaluationModal(currentEvaluatingTeamId || allTeams[0]?.id || 1);
    });
  });

  // Modal Save
  document.getElementById('modal-save-eval-btn')?.addEventListener('click', saveModalEvaluation);

  // Modal Close
  document.getElementById('modal-close-btn')?.addEventListener('click', closeEvaluationModal);
  const modal = document.getElementById('evaluation-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeEvaluationModal();
    });
  }

  // Reset 0 (PIN Protected: 784567)
  document.getElementById('btn-reset-scores')?.addEventListener('click', () => {
    requestAdminPin(() => {
      if (!confirm('Are you sure you want to reset all team marks and prompts to 0?')) return;
      const resetList = allTeams.map(t => ({
        ...t,
        round1: { score: 0, prompts: 0, notes: '' },
        round2: { score: 0, prompts: 0, notes: '' },
        round3: { score: 0, prompts: 0, notes: '' },
        totalScore: 0,
        totalPrompts: 0,
        efficiency: 0
      }));
      saveTeams(resetList);
      populateModalPicker();
      showToast('All marks and prompts reset to 0.', 'info');
    });
  });

  // Keyboard Shortcuts:
  // F = Full Screen, S = Auto Scroll, E = Enter Marks (PIN protected), Esc = Close Modal
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'f' || e.key === 'F') {
      toggleFullScreen();
    } else if (e.key === 's' || e.key === 'S') {
      toggleAutoScroll();
    } else if (e.key === 'e' || e.key === 'E') {
      requestAdminPin(() => {
        openEvaluationModal(currentEvaluatingTeamId || 1);
      });
    }
  });
}

// Utility: escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
