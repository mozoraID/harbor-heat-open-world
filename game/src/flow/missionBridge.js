// Mission bridge: runs missionRunner against real state, spawns 3D markers, fills HUD, gives rewards.
import * as THREE from 'three';
import { createMissionRunner } from '../missions/missionRunner.js';
import { GIVER_BLIPS } from '../missions/markers.js';
import { getMissionGroups } from '../missions/missionDefs/index.js';
import { getRankProgress, applyRewards, getUnlocksForXp } from '../missions/progression.js';
import { autosave } from '../save/saveSlots.js';

function makeLabelTexture(text, color = '#ffcc4d') {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0,0,128,128);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(64,44,28,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.font = '900 34px "Segoe UI", Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(text || '!'), 64, 46);
  // little pointer
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(54,68); ctx.lineTo(74,68); ctx.lineTo(64,84); ctx.closePath(); ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export function createMissionBridge(ctx = {}) {
  const { state, scene, hud } = ctx;
  let completedIds = [];
  let pendingDialogue = null;
  let dialogueUntil = 0;
  let lastPassed = null;

  const runner = createMissionRunner({
    dialogue: (payload) => {
      if (payload && payload.dialogue) {
        pendingDialogue = { ...payload.dialogue, visible: true };
        dialogueUntil = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + 4200;
      }
    },
    onMissionPassed: (payload) => {
      lastPassed = payload;
      if (state && payload && payload.reward) {
        // apply rewards to live state
        const saveLike = {
          money: state.player.money,
          respectXP: state.progression?.respectXP ?? 0,
          rank: state.rank?.name || 'Street Rat',
          completedMissions: [...completedIds],
          unlockedWeapons: state.unlockedWeapons || ['fists','bat','pistol','smg'],
        };
        const updated = applyRewards(saveLike, { ...payload.reward, completedMissionId: payload.missionId });
        state.player.money = updated.money;
        completedIds = updated.completedMissions;
        const prog = getRankProgress(updated.respectXP);
        state.rank = { name: prog.name, xp: updated.respectXP, next: prog.next };
        state.progression = { respectXP: updated.respectXP };
        state.unlockedWeapons = updated.unlockedWeapons;
        if (ctx.onMissionPassed) try { ctx.onMissionPassed(payload, updated); } catch {}
      }
    },
  });

  // 3D marker group
  const markerGroup = new THREE.Group();
  markerGroup.name = 'missionMarkers';
  if (scene) scene.add(markerGroup);

  let activeMarker = null;
  let activeTargetKey = null;

  function clearMarker() {
    if (activeMarker) {
      markerGroup.remove(activeMarker);
      activeMarker.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
      activeMarker = null;
    }
    activeTargetKey = null;
  }

  function ensureMarker(target, color = '#ffcc4d', icon = '!') {
    if (!target || target.x == null) { clearMarker(); return; }
    const key = `${target.x},${target.z},${icon},${color}`;
    if (activeMarker && activeTargetKey === key) {
      activeMarker.position.x = target.x;
      activeMarker.position.z = target.z;
      return;
    }
    clearMarker();
    activeTargetKey = key;
    const g = new THREE.Group();
    const cylGeo = new THREE.CylinderGeometry(2.2, 2.2, 6, 24, 1, true);
    const cylMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.position.y = 3;
    g.add(cyl);
    const ringGeo = new THREE.RingGeometry(1.6, 2.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    g.add(ring);
    const spriteMat = new THREE.SpriteMaterial({ map: makeLabelTexture(icon, color), transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.5, 3.5, 1);
    sprite.position.y = 7.5;
    g.add(sprite);
    const light = new THREE.PointLight(new THREE.Color(color), 0.8, 18);
    light.position.y = 3;
    g.add(light);
    g.position.set(target.x, 0, target.z);
    g.userData.baseY = 0;
    markerGroup.add(g);
    activeMarker = g;
  }

  function updateMarkerAnim(time) {
    if (!activeMarker) return;
    const t = time || 0;
    activeMarker.children.forEach(ch => {
      if (ch.isSprite) ch.position.y = 7.5 + Math.sin(t * 2.2) * 0.4;
      if (ch.isMesh && ch.geometry && ch.geometry.type === 'CylinderGeometry') ch.material.opacity = 0.28 + Math.sin(t * 3) * 0.08;
      if (ch.isMesh && ch.geometry && ch.geometry.type === 'RingGeometry') ch.rotation.z = t * 0.8;
    });
  }

  function syncHudFields(patch) {
    if (!state) return;
    if (patch.mission) state.mission = { ...(state.mission || {}), ...patch.mission };
    if (patch.minimap) {
      state.minimap = { ...(state.minimap || {}), ...patch.minimap };
    }
    // giver blips for minimap/maps: expose to consumers
    state.mapMarkers = state.mapMarkers || {};
    state.mapMarkers.givers = GIVER_BLIPS.map(b => ({ x: b.x, z: b.z, label: b.label, name: b.name, color: b.color }));
    // also supply as shop-like blips for minimap widget (lettered)
    if (!state.minimap) state.minimap = {};
    if (!Array.isArray(state.minimap.shops) || state.minimap.shops.length === 0) {
      // don't overwrite if other systems provide shops; provide givers separately in custom field
      state.minimap.givers = GIVER_BLIPS.map(b => ({ x: b.x, z: b.z, letter: b.label, color: b.color }));
    }
  }

  function getMissionGroupsWithStatus() {
    const groups = getMissionGroups();
    let foundActive = false;
    const activeId = runner.getActiveMission()?.id;
    return groups.map(g => ({
      act: g.act,
      missions: g.missions.map(m => {
        const done = completedIds.includes(m.id);
        const unlocked = (m.unlockRequires || []).every(id => completedIds.includes(id));
        let status = 'locked';
        if (done) status = 'done';
        else if (m.id === activeId || (unlocked && !foundActive && !runner.isActive())) { status = 'active'; foundActive = true; }
        else if (unlocked) status = 'active';
        return { id: m.id, name: m.title, title: m.title, status, district: m.district, giver: m.giverName };
      })
    }));
  }

  function update(dt, gameState = state) {
    if (!gameState) return;
    const hudPatch = runner.update(gameState, dt) || {};
    if (hudPatch.mission) syncHudFields(hudPatch);
    else if (runner.isActive()) syncHudFields(runner.getHudState(gameState));
    // marker
    const stage = runner.getActiveStage();
    if (stage && stage.target) {
      const icon = stage.type === 'steal' ? 'C' : stage.type === 'chase' ? '!' : stage.type === 'shootout' ? 'X' : stage.type === 'photo' ? 'P' : (runner.getActiveMission()?.number || '!');
      ensureMarker(stage.target, '#ffcc4d', icon);
    } else {
      clearMarker();
    }
    updateMarkerAnim(gameState.time || 0);

    // dialogue timeout
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (pendingDialogue && now < dialogueUntil) {
      gameState.dialogue = pendingDialogue;
    } else if (pendingDialogue && now >= dialogueUntil) {
      pendingDialogue = null;
      if (gameState.dialogue) gameState.dialogue = { ...gameState.dialogue, visible: false };
    }

    // expose groups for pause menu
    gameState.missionGroups = getMissionGroupsWithStatus();
    gameState.completedMissions = [...completedIds];
  }

  function startMission(id, ids) {
    if (Array.isArray(ids)) completedIds = [...ids];
    return runner.startMission(id, completedIds);
  }
  function setCompleted(ids = []) { completedIds = [...ids]; runner.setProgress(completedIds); }
  function getCompleted() { return [...completedIds]; }
  function getRunner() { return runner; }
  function consumePassed() { const p = lastPassed; lastPassed = null; return p; }
  function destroy() { clearMarker(); if (scene) scene.remove(markerGroup); }

  return { update, startMission, setCompleted, getCompleted, getRunner, getMissionGroupsWithStatus, consumePassed, destroy, markerGroup };
}
