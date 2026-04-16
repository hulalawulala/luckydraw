// db.js - Simple local storage "backend" for the static lucky draw app

const DEFAULT_SETTINGS = {
  spinDuration: 5,
  currentRound: 1
};

function getSettings() {
  const settings = localStorage.getItem('ld_settings');
  if (settings) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(settings) };
  }
  return DEFAULT_SETTINGS;
}

function updateSettings(newSettings) {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  localStorage.setItem('ld_settings', JSON.stringify(updated));
}

// History Management
function getWinnerHistory() {
  const data = localStorage.getItem('ld_history');
  return data ? JSON.parse(data) : [];
}

function addWinnerHistory(name, round) {
  const history = getWinnerHistory();
  history.push({ name, round, timestamp: new Date().toISOString() });
  localStorage.setItem('ld_history', JSON.stringify(history));
}

function deleteWinnerHistoryByIndex(index) {
  const history = getWinnerHistory();
  if (index >= 0 && index < history.length) {
    history.splice(index, 1);
    localStorage.setItem('ld_history', JSON.stringify(history));
  }
}

function clearWinnerHistory() {
  localStorage.removeItem('ld_history');
}

// Removing specific winner
function removeParticipantByName(name) {
  const participants = getParticipants();
  const index = participants.indexOf(name);
  if (index !== -1) {
    participants.splice(index, 1);
    localStorage.setItem('ld_participants', JSON.stringify(participants));
  }
}

function getParticipants() {
  const participants = localStorage.getItem('ld_participants');
  return participants ? JSON.parse(participants) : [];
}

function addParticipants(namesText) {
  const current = getParticipants();
  const names = namesText.split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 0);
  
  // Allow duplicate names so users can have multiple raffle tickets
  const combined = [...current, ...names];
  localStorage.setItem('ld_participants', JSON.stringify(combined));
  return combined;
}

function deleteParticipant(index) {
  const current = getParticipants();
  current.splice(index, 1);
  localStorage.setItem('ld_participants', JSON.stringify(current));
  
  // Optional: Clean up rigged winners if that index was used, 
  // but to keep it simple, if participant is deleted, the rigged mapping may break.
  // Better to rig by exact name.
  return current;
}

function searchParticipants(query) {
  const current = getParticipants();
  if (!query) return [];
  const qStr = query.toLowerCase();
  
  // Return early matches up to 50 results to not overload UI
  const results = [];
  for (let i = 0; i < current.length; i++) {
    if (current[i].toLowerCase().includes(qStr)) {
      results.push({ index: i, name: current[i] });
      if (results.length >= 50) break;
    }
  }
  return results;
}

// Rigging management uses exact participant name
function getRigged() {
  const rigged = localStorage.getItem('ld_rigged');
  return rigged ? JSON.parse(rigged) : {}; // { "1": "Alice", "2": "Bob" }
}

function setRiggedWinner(round, name) {
  const rigged = getRigged();
  rigged[round] = name;
  localStorage.setItem('ld_rigged', JSON.stringify(rigged));
}

function getRiggedWinnerForRound(round) {
  const rigged = getRigged();
  return rigged[round] || null;
}

function deleteRiggedWinner(round) {
  const rigged = getRigged();
  delete rigged[round];
  localStorage.setItem('ld_rigged', JSON.stringify(rigged));
}

// Ensure at least 1 mock data if empty
function initializeDB() {
  const p = getParticipants();
  if (p.length === 0) {
    addParticipants("Test User 1\nTest User 2\nTest User 3\nTest User 4\nTest User 5\nTest User 6\nTest User 7\nTest User 8");
  }
}

initializeDB();
