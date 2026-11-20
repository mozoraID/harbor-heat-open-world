// Mission runner state machine: tracks active mission/stage, checks completion, emits events, fills HUD fields.
import { ALL_MISSIONS, MISSIONS_BY_ID } from './missionDefs/index.js';
import { CHARACTERS } from './characters.js';
import { getCharacter } from './characters.js';

function dist2(ax, az, bx, bz) { const dx = ax - bx, dz = az - bz; return dx*dx + dz*dz; }
function near(player, target, radius = 10) {
  if (!player || !target) return false;
  return dist2(player.x || 0, player.z || 0, target.x || 0, target.z || 0) <= (radius * radius);
}

export function createMissionRunner(callbacks = {}) {
  let activeId = null;
  let stageIndex = 0;
  let stageState = {}; // per-stage runtime: timer, kills, collected, etc.
  let failed = false;
  let passedIds = new Set();
  const listeners = { onStageStart: [], onStageComplete: [], onMissionPassed: [], onMissionFailed: [] };

  function on(event, fn) { if (listeners[event]) listeners[event].push(fn); }
  function emit(event, payload) {
    (listeners[event] || []).forEach(fn => { try { fn(payload); } catch {} });
    if (typeof callbacks[event] === 'function') { try { callbacks[event](payload); } catch {} }
  }

  function getActiveMission() { return activeId ? (MISSIONS_BY_ID[activeId] || null) : null; }
  function getActiveStage() { const m = getActiveMission(); return m ? (m.stages[stageIndex] || null) : null; }

  function canStart(missionId, completedIds = []) {
    const m = MISSIONS_BY_ID[missionId]; if (!m) return false;
    const done = new Set(completedIds || passedIds);
    return (m.unlockRequires || []).every(id => done.has(id));
  }

  function buildMissionHud(mission, stage, idx) {
    if (!mission || !stage) return null;
    return {
      number: mission.number,
      act: mission.actLabel || ('ACT ' + (mission.act === 1 ? 'I' : mission.act === 2 ? 'II' : 'III')),
      title: mission.title,
      stage: idx + 1,
      stageTotal: mission.stages.length,
      objective: stage.objective || '',
      highlight: stage.highlight || null,
      next: stage.next || null,
      timer: (stage.type === 'timed' && stageState.timer != null) ? stageState.timer : (stage.timer != null ? stage.timer : null),
    };
  }

  function buildDialogue(line) {
    if (!line) return null;
    const ch = line.speaker ? getCharacter(Object.keys(CHARACTERS).find(k => CHARACTERS[k].name === line.speaker)) : null;
    return { visible: true, speaker: line.speaker, text: line.text, role: ch?.role || line.role, seed: ch?.portraitSeed || line.speaker };
  }

  function startMission(missionId, completedIds = []) {
    const m = MISSIONS_BY_ID[missionId];
    if (!m) return false;
    if (!canStart(missionId, completedIds)) return false;
    activeId = missionId;
    stageIndex = 0;
    failed = false;
    beginStage(0);
    return true;
  }

  function beginStage(idx) {
    const m = getActiveMission(); if (!m) return;
    stageIndex = idx;
    const stage = m.stages[idx]; if (!stage) return;
    stageState = { startedAt: Date.now(), timer: stage.timeLimit ?? stage.timer ?? null, kills: 0, collected: false, delivered: false, rammed: false, photographed: false, enteredCar: false };
    // auto-grant wanted for stages that need it
    const payload = { mission: m, stage, stageIndex: idx, missionId: m.id };
    emit('onStageStart', payload);
    if (stage.startDialogue) emit('dialogue', { dialogue: buildDialogue(stage.startDialogue), ...payload });
  }

  function completeStage(gameState = {}) {
    const m = getActiveMission(); const stage = getActiveStage();
    if (!m || !stage) return;
    emit('onStageComplete', { mission: m, stage, stageIndex, missionId: m.id });
    if (stage.endDialogue) emit('dialogue', { dialogue: buildDialogue(stage.endDialogue), mission: m, stage, stageIndex });
    const next = stageIndex + 1;
    if (next >= m.stages.length) {
      passedIds.add(m.id);
      activeId = null;
      emit('onMissionPassed', { mission: m, missionId: m.id, reward: m.reward });
    } else {
      beginStage(next);
    }
  }

  function failMission(reason = 'failed') {
    const m = getActiveMission(); if (!m) return;
    failed = true;
    const mid = m.id;
    activeId = null;
    emit('onMissionFailed', { mission: m, missionId: mid, reason });
  }

  function checkStage(gameState, dt) {
    const m = getActiveMission(); const stage = getActiveStage();
    if (!m || !stage || failed) return;
    const p = gameState.player || {};
    const wanted = p.wanted ?? 0;

    // timed countdown
    if ((stage.type === 'timed' || stage.timer != null) && stageState.timer != null) {
      stageState.timer = Math.max(0, stageState.timer - (dt || 0));
      if (stageState.timer <= 0 && stage.type === 'timed') { failMission('time'); return; }
    }

    switch (stage.type) {
      case 'goto':
        if (near(p, stage.target, stage.target?.radius || 10)) completeStage(gameState);
        break;
      case 'collect':
        if (near(p, stage.target, stage.target?.radius || 8)) { stageState.collected = true; completeStage(gameState); }
        break;
      case 'drive_to': {
        const carOk = !stage.requireCar || !!p.inCar || (gameState.car && (!stage.carName || gameState.car.name === stage.carName));
        if (carOk && near(p, stage.target, stage.target?.radius || 12)) completeStage(gameState);
        break;
      }
      case 'steal': {
        const inNamed = p.inCar && (!stage.carName || (gameState.car && gameState.car.name === stage.carName));
        if (inNamed || near(p, stage.target, stage.target?.radius || 15) && p.inCar) { stageState.enteredCar = true; completeStage(gameState); }
        break;
      }
      case 'chase': {
        const targetObj = gameState.chaseTarget || stage.target;
        const hits = gameState.chaseHits ?? stageState.kills;
        if ((stage.targetCount && hits >= stage.targetCount) || (targetObj && targetObj.destroyed) || (targetObj && targetObj.rammed)) completeStage(gameState);
        // fallback: if near dynamic target point
        if (targetObj && !targetObj.destroyed && near(p, targetObj, stage.target?.radius || 18) && (gameState.ramImpact || gameState.chaseContact)) completeStage(gameState);
        break;
      }
      case 'escape':
        if (wanted <= (stage.wantedMax ?? 0)) completeStage(gameState);
        break;
      case 'timed':
        if (near(p, stage.target, stage.target?.radius || 12)) completeStage(gameState);
        break;
      case 'shootout': {
        const kills = gameState.enemiesCleared ?? gameState.kills ?? stageState.kills;
        if (kills >= (stage.targetCount || 1)) completeStage(gameState);
        break;
      }
      case 'photo':
        if (gameState.photoTaken || (near(p, stage.target, stage.target?.radius || 10) && gameState.photoReady)) { stageState.photographed = true; completeStage(gameState); }
        // allow simple proximity+flag
        if (near(p, stage.target, stage.target?.radius || 10) && gameState.actionPhoto) completeStage(gameState);
        break;
      default:
        if (near(p, stage.target, stage.target?.radius || 10)) completeStage(gameState);
        break;
    }
  }

  function update(gameState = {}, dt = 0) {
    if (!activeId) return getHudState(gameState);
    checkStage(gameState, dt);
    return getHudState(gameState);
  }

  function getHudState(gameState = {}) {
    const m = getActiveMission(); const stage = getActiveStage();
    const out = {};
    if (m && stage) {
      out.mission = buildMissionHud(m, stage, stageIndex);
      out.minimap = out.minimap || {};
      if (stage.target && stage.target.x != null) out.minimap.target = { x: stage.target.x, z: stage.target.z };
    }
    return out;
  }

  function setProgress(completedIds = []) { passedIds = new Set(completedIds); }
  function getProgress() { return Array.from(passedIds); }
  function isActive() { return !!activeId; }
  function getStatus() { return { activeId, stageIndex, stageState: { ...stageState }, failed, passed: Array.from(passedIds) }; }

  return {
    startMission, update, on, failMission, completeStage,
    getActiveMission, getActiveStage, getHudState, getStatus,
    isActive, setProgress, getProgress, canStart,
  };
}
