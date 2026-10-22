# AWS Student Builder Group — Official Chapter Website

Official website for the **AWS Student Builder Group (SBG)** at Graphic Era Hill University (GEHU), Bhimtal Campus.

---

## 🏆 Vibeathon 2026 Live Leaderboard

A comprehensive evaluation and live ranking leaderboard for the **AWS SBG Vibeathon**.

### Evaluation Structure
- **40 Competing Teams** (Team 01 to Team 40)
- **3 Evaluation Rounds** (50 marks each • Max 150 marks total):
  - **Round 1 (50 Marks)**: Problem Ideation & Prompt Architecture
  - **Round 2 (50 Marks)**: AWS Cloud Services & Prototype Implementation
  - **Round 3 (50 Marks)**: Live Demo, UI Polish & Prompt Economy
- **Prompt Metrics & Efficiency**:
  - Prompts logged per round (R1 Prompts, R2 Prompts, R3 Prompts)
  - Total prompt count & Prompt Efficiency Index (`Marks / Prompts`)
- **40-Prompt Cap & Ranking Hierarchy**:
  - **Prompt Limit Rule**: Teams with **40 or fewer prompts (≤ 40)** are ranked **strictly above** any team that exceeds 40 prompts (> 40).
  - **Points Rule**: Within each tier, teams with higher total scores rank higher.
  - **Tie-Breaking Rule**: In case of identical total scores, the team with **fewer prompts used** is awarded the higher rank.

---

## 🚀 Features & Controls

1. **Top 3 Podium**: Olympic-style Hall of Fame showcasing 1st place (👑 Gold), 2nd place (🥈 Silver), and 3rd place (🥉 Bronze).
2. **Evaluator Quick-Edit Mode**: Toggle inline editing on the table to adjust round marks and prompt counts directly in cells with instant recalculation.
3. **Scorecard Modal**: Click **✏️ Evaluate** on any team row to open sliders (0–50), prompt fields, evaluator notes, and live preview.
4. **Search & Filters**:
   - Live search by team number, name, project, or member
   - Filter pills: All 40 Teams, Top 10, Round 1 Top, Round 2 Top, Round 3 Top, High Efficiency
   - Sort dropdown: Overall Rank, Fewest Prompts, Most Prompts, Round 1–3, Team Number
5. **CSV Export & Import**:
   - Download the full leaderboard spreadsheet with one click
   - Upload an updated CSV to batch-update all 40 teams
6. **Data Persistence**:
   - Automatically saves to `data/leaderboard.json` via backend API (`server.js`)
   - Also automatically caches in browser `localStorage` as offline fallback (works even when opening `public/leaderboard.html` directly!)

---

## 🛠️ How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the Express server
npm start
# or for development with nodemon:
npm run dev

# 3. Open in browser:
# http://localhost:3000
# http://localhost:3000/leaderboard.html
```