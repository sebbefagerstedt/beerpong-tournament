import { THEMES, setTheme, getTheme, TEAM_COLORS } from './themes.js';
import { state, loadState, saveState, resetState, initStats, triggerSave } from './state.js';
import { generateRoundRobin, getSortedStandings, getAutoFormat, initPlayoff, isPlayoffComplete } from './tournament-engine.js';
import {
  initTeamInputs, getTeamNames, updateMatchCount, updateSetupDisplays,
  renderStandings, updateTopProgress, renderMatches, renderMatchCard,
  initMatchEvents, showFinal, showPlayoffWinner, spawnConfetti,
  renderPlayoffBracket, initPlayoffEvents, openPlayoffModal,
  confirmReset, closeModal, showTournamentUI, showSetupUI, setOnMatchFinished
} from './ui.js';
import {
  initOnline, openRoomModal, closeRoomModal, createRoom, joinRoom,
  leaveRoom, endRoom, setOnRemoteState, getIsSpectator
} from './online.js';

// === Init ===

function init() {
  // Theme selector
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', e => {
      state.themeId = e.target.value;
      setTheme(state.themeId);
      updateSetupDisplays();
      document.getElementById('header-title').textContent = getTheme().title;
      document.getElementById('header-sub').textContent = getTheme().subtitle;
      state.scoreToWin = getTheme().defaultScoreToWin;
      updateSetupDisplays();
    });
  }

  // Load saved state or init fresh
  const restored = loadState();
  setTheme(state.themeId);
  document.getElementById('header-title').textContent = getTheme().title;

  if (restored) {
    if (state.tournamentStarted) {
      showTournamentUI();
      renderMatches();
      renderStandings();
      updateTopProgress();
      if (state.matches.every(m => m.done)) showFinal();
    }
    if (state.playoffActive) {
      document.getElementById('setup-section').style.display = 'none';
      document.getElementById('playoff-section').classList.add('visible');
      document.getElementById('fab-reset').style.display = 'block';
      document.getElementById('fab-inline-reset').style.display = 'inline-block';
      renderPlayoffBracket();
      const winner = isPlayoffComplete();
      if (winner) showPlayoffWinner(winner);
    }
  } else {
    initTeamInputs();
    updateMatchCount();
    updateSetupDisplays();
  }

  // Wire events
  initMatchEvents();
  initPlayoffEvents();
  setOnMatchFinished(showFinal);

  // Setup controls
  document.getElementById('btn-teams-down').onclick = () => { state.numTeams = Math.max(2, state.numTeams - 1); updateSetupDisplays(); updateMatchCount(); initTeamInputs(); };
  document.getElementById('btn-teams-up').onclick = () => { state.numTeams = Math.min(12, state.numTeams + 1); updateSetupDisplays(); updateMatchCount(); initTeamInputs(); };
  document.getElementById('btn-score-down').onclick = () => { state.scoreToWin = Math.max(1, state.scoreToWin - 1); updateSetupDisplays(); };
  document.getElementById('btn-score-up').onclick = () => { state.scoreToWin = Math.min(30, state.scoreToWin + 1); updateSetupDisplays(); };
  document.getElementById('btn-time-down').onclick = () => { state.defaultMinutes = Math.max(1, state.defaultMinutes - 1); updateSetupDisplays(); };
  document.getElementById('btn-time-up').onclick = () => { state.defaultMinutes = Math.min(60, state.defaultMinutes + 1); updateSetupDisplays(); };

  document.getElementById('btn-start').onclick = startTournament;
  document.getElementById('btn-start-playoff').onclick = startPlayoffStandalone;
  document.getElementById('btn-playoff-from-standings').onclick = openPlayoffModal;

  // Reset
  const doResetFn = () => {
    resetState();
    setTheme(state.themeId);
    showSetupUI();
    initTeamInputs();
    updateMatchCount();
    updateSetupDisplays();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  document.getElementById('fab-reset').onclick = () => confirmReset(doResetFn);
  document.getElementById('fab-inline-reset').onclick = () => confirmReset(doResetFn);

  // Fullscreen
  document.getElementById('btn-fullscreen').onclick = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  document.getElementById('btn-new-tournament').onclick = () => confirmReset(doResetFn);
  document.getElementById('btn-cancel-reset').onclick = closeModal;

  // Modal backdrop close
  document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById('room-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeRoomModal(); });
  document.getElementById('playoff-modal').addEventListener('click', e => { if (e.target === e.currentTarget) e.target.classList.remove('visible'); });

  // Online
  document.getElementById('btn-online').onclick = openRoomModal;
  document.getElementById('btn-create-room').onclick = createRoom;
  document.getElementById('btn-join-room').onclick = joinRoom;
  document.getElementById('btn-close-room-modal').onclick = closeRoomModal;
  document.getElementById('btn-leave-room').onclick = leaveRoom;
  document.getElementById('btn-end-room').onclick = endRoom;

  setOnRemoteState(onRemoteState);
  initOnline();
}

// === Tournament Start ===

function startTournament() {
  const teams = getTeamNames();
  state.teams = teams;
  initStats(teams);
  state.matches = generateRoundRobin(teams);
  state.tournamentStarted = true;
  showTournamentUI();
  renderMatches();
  renderStandings();
  updateTopProgress();
  triggerSave();
}

function startPlayoffStandalone() {
  const teams = getTeamNames();
  state.teams = teams;
  teams.forEach((t, i) => {
    if (!state.stats[t]) state.stats[t] = { wins: 0, losses: 0, played: 0, cupsFor: 0, points: 0, color: TEAM_COLORS[i % TEAM_COLORS.length] };
  });
  const formatSize = getAutoFormat(state.numTeams);
  const playoffTeams = teams.slice(0, formatSize);
  initPlayoff(playoffTeams, formatSize);
  document.getElementById('setup-section').style.display = 'none';
  document.getElementById('playoff-section').classList.add('visible');
  document.getElementById('fab-reset').style.display = 'block';
  document.getElementById('fab-inline-reset').style.display = 'inline-block';
  document.getElementById('header-sub').textContent = `Slutspel · ${state.scoreToWin} ${getTheme().scoreUnit}`;
  renderPlayoffBracket();
  document.getElementById('playoff-section').scrollIntoView({ behavior: 'smooth' });
}

// === Online Remote State Handler ===

function onRemoteState(s) {
  if (!s) {
    if (!getIsSpectator()) return;
    alert('Värden har avslutat turneringen.');
    leaveRoom();
    return;
  }
  state.numTeams = s.numTeams;
  state.scoreToWin = s.scoreToWin ?? s.cupsToWin ?? 3;
  state.defaultMinutes = s.defaultMinutes;
  state.teams = s.teams;
  state.stats = s.stats;
  state.tournamentStarted = s.tournamentStarted;
  state.themeId = s.themeId || 'beerpong';
  state.playoffRounds = s.playoffRounds || [];
  state.playoffActive = s.playoffActive || false;

  setTheme(state.themeId);

  if (s.tournamentStarted) {
    // Sync timer intervals
    state.matches = s.matches;
    state.matches.forEach(m => {
      if (m.timerRunning && !m.done && !state.timerIntervals[m.id]) {
        state.timerIntervals[m.id] = setInterval(() => renderMatchCard(m.id), 1000);
      }
      if ((!m.timerRunning || m.done) && state.timerIntervals[m.id]) {
        clearInterval(state.timerIntervals[m.id]);
        delete state.timerIntervals[m.id];
      }
    });
    showTournamentUI();
    const grid = document.getElementById('matches-grid');
    if (grid.children.length === state.matches.length) {
      state.matches.forEach(m => renderMatchCard(m.id));
    } else {
      renderMatches();
    }
    renderStandings();
    updateTopProgress();
    if (state.matches.every(m => m.done)) showFinal();
  } else {
    document.getElementById('setup-section').style.display = 'none';
    document.getElementById('standings-section').style.display = 'none';
    document.getElementById('matches-section').style.display = 'none';
    document.getElementById('progress-label').textContent = 'Väntar på att värden startar…';
  }

  if (state.playoffActive) {
    document.getElementById('playoff-section').classList.add('visible');
    renderPlayoffBracket();
    const winner = isPlayoffComplete();
    if (winner) showPlayoffWinner(winner);
  }

  if (getIsSpectator()) {
    document.getElementById('fab-reset').style.display = 'none';
    document.getElementById('fab-inline-reset').style.display = 'none';
  }
}

// Boot
init();
