// Game flow: title, play, pause/phone, missions, save/load, overlays, and bridges.
import { createTitleCamera } from './titleCamera.js';
import { createMissionBridge } from './missionBridge.js';
import { createActivityBridge } from './activityBridge.js';
import { createAudioBridge } from './audioBridge.js';
import { createFeatureChecklist } from './featureChecklist.js';
import { createTitleScreen } from '../ui/menus/titleScreen.js';
import { createPauseMenu } from '../ui/menus/pauseMenu.js';
import { createPhone } from '../ui/menus/phone.js';
import { createWastedScreen } from '../ui/menus/wastedScreen.js';
import { createBustedScreen } from '../ui/menus/bustedScreen.js';
import { createMissionPassed } from '../ui/menus/missionPassed.js';
import { createControlsCard } from '../ui/menus/controlsCard.js';
import { listSlots, getSlot, saveSlot, autosave, loadAutosave, normalizeSlot } from '../save/saveSlots.js';
import { getRankProgress, getUnlocksForXp } from '../missions/progression.js';
import { ALL_MISSIONS } from '../missions/missionDefs/index.js';

export function createGameFlow(ctx = {}) {
  const { state, hud, input, scene, camera, renderer, player, cars, city, mapData } = ctx;
  const app = { scene, camera, renderer };
  const uiRoot = document.body;

  const titleCamera = createTitleCamera(app, state);
  const audio = createAudioBridge({ state });
  const mission = createMissionBridge({ state, scene, hud, onMissionPassed: handleMissionPassed });
  const activity = createActivityBridge({ state, scene, input });
  const checklist = createFeatureChecklist(uiRoot);

  const controlsCard = createControlsCard(uiRoot);
  const wasted = createWastedScreen(uiRoot, { onRetry: () => handleRetry('wasted'), onQuit: () => goToTitle() });
  const busted = createBustedScreen(uiRoot, { onRetry: () => handleRetry('busted'), onQuit: () => goToTitle() });
  const missionPassed = createMissionPassed(uiRoot, { onDone: () => { missionPassed.hide(); } });

  let mode = 'title'; // title | play | pause | phone
  let overlay = null; // 'wasted' | 'busted' | 'missionPassed' | null
  let introDialogueUntil = 0;
  let lastRespawnState = null;
  let playTimeAccum = 0;
  let lastDt = 0;

  function setMode(m) {
    mode = m;
    if (state) state.mode = (m === 'play') ? 'play' : m;
  }

  function isPlaying() {
    return mode === 'play' && !overlay;
  }

  function showHud(on) {
    if (!hud) return;
    if (on) hud.show(); else hud.hide();
  }

  // Pause menu
  const pause = createPauseMenu(uiRoot, {
    onResume: () => closePause(),
    onClose: () => { if (mode === 'pause') setMode('play'); showHud(true); },
    onSaveSlot: (n) => { saveToSlot(n); },
    getSlots: () => listSlots(),
  });
  if (mapData) pause.setMapData(mapData);

  // Phone
  const phone = createPhone(uiRoot, {
    onClose: () => closePhone(),
    onCall: (id) => { if (!state.notifications) state.notifications = []; state.notifications.push({ text: `Calling ${id}...`, tone: 'gold' }); },
    onRadioOpen: () => {},
  });

  // Title screen
  const title = createTitleScreen(uiRoot, {
    onContinue: () => continueGame(),
    onNewGame: () => newGame(),
    onLoadSlot: (slot, data) => loadGameFromSlot(slot, data),
    onControls: () => controlsCard.show(),
    getSlots: () => listSlots(),
  });

  function currentSaveSnapshot() {
    const xp = state?.progression?.respectXP ?? 0;
    const rank = getRankProgress(xp);
    return normalizeSlot({
      money: state?.player?.money ?? 0,
      respectXP: xp,
      rank: rank.name,
      completedMissions: mission.getCompleted(),
      unlockedWeapons: state?.unlockedWeapons || ['fists', 'bat', 'pistol', 'smg'],
      ownedCars: state?.ownedCars || [],
      playerPosition: { x: state?.player?.x ?? 0, y: state?.player?.y ?? 0, z: state?.player?.z ?? 0 },
      playTime: state?.playTime ?? playTimeAccum,
    });
  }

  function applySaveData(data) {
    if (!data || !state) return;
    const d = normalizeSlot(data);
    state.player.money = d.money;
    const xp = d.respectXP || 0;
    const prog = getRankProgress(xp);
    state.progression = { respectXP: xp };
    state.rank = { name: prog.name, xp, next: prog.next };
    state.unlockedWeapons = d.unlockedWeapons || getUnlocksForXp(xp).weapons;
    mission.setCompleted(d.completedMissions || []);
    // position
    if (d.playerPosition) {
      state.player.x = d.playerPosition.x || 0;
      state.player.y = d.playerPosition.y || 0;
      state.player.z = d.playerPosition.z || 0;
    }
    state.playTime = d.playTime || 0;
    playTimeAccum = state.playTime;
    // start next mission in progression if none active
    if (!mission.getRunner().isActive()) {
      const next = ALL_MISSIONS.find(m => !(d.completedMissions || []).includes(m.id) && (m.unlockRequires || []).every(id => (d.completedMissions || []).includes(id)));
      if (next) mission.startMission(next.id, d.completedMissions || []);
    }
    if (typeof ctx.onLoad === 'function') try { ctx.onLoad(d); } catch {}
  }

  function saveToSlot(n) {
    const snap = currentSaveSnapshot();
    saveSlot(n, snap);
    if (!state.notifications) state.notifications = [];
    state.notifications.push({ text: `SAVED TO SLOT ${n}`, tone: 'mint' });
  }

  function autoSave() {
    try { autosave(currentSaveSnapshot()); } catch {}
  }

  function continueGame() {
    const auto = loadAutosave();
    const slots = listSlots();
    const best = auto || (slots.find(s => s.data)?.data) || null;
    if (best) {
      applySaveData(best);
      enterPlay();
    } else {
      newGame();
    }
  }

  function loadGameFromSlot(slot, data) {
    const d = data || getSlot(slot);
    if (!d) return;
    applySaveData(d);
    enterPlay();
  }

  function newGame() {
    if (state) {
      state.player.money = 240;
      state.player.health = 100;
      state.player.armour = 0;
      state.player.wanted = 0;
      state.player.x = 0; state.player.y = 0; state.player.z = 300; // Marigold Beach
      state.player.yaw = Math.PI;
      state.player.inCar = null; state.car = null;
      state.progression = { respectXP: 0 };
      state.rank = { name: 'Street Rat', xp: 0, next: 500 };
      state.unlockedWeapons = ['fists', 'bat'];
      state.playTime = 0;
    }
    mission.setCompleted([]);
    const started = mission.startMission('act1_first_light', []);
    if (state) {
      state.dialogue = { visible: true, speaker: 'Mama Inés', role: 'Fixer Matriarch', seed: 'Mama Inés', text: "Rio... you came back to Port Solenne. Mama needs you — Kade's debt won't wait." };
      introDialogueUntil = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + 4500;
    }
    if (typeof ctx.onNewGame === 'function') try { ctx.onNewGame(); } catch {}
    enterPlay();
  }

  function enterPlay() {
    title.hide();
    checklist.setCompactTitleMode(false);
    titleCamera.deactivate();
    showHud(true);
    closePause(true);
    closePhone(true);
    setMode('play');
    overlay = null;
  }

  function goToTitle() {
    overlay = null;
    wasted.hide(); busted.hide(); missionPassed.hide();
    closePause(true); closePhone(true);
    showHud(false);
    title.show();
    checklist.show();
    checklist.setCompactTitleMode(true);
    titleCamera.activate();
    setMode('title');
  }

  function openPause() {
    if (mode !== 'play' || overlay) return;
    pause.setMapData(mapData);
    pause.show({
      ...buildPauseState(),
      mapData,
    });
    phone.hide();
    setMode('pause');
  }
  function closePause(silent) {
    pause.hide();
    if (!silent && mode === 'pause') setMode('play');
  }
  function openPhone() {
    if (mode !== 'play' || overlay) return;
    phone.show(buildPhoneState());
    pause.hide();
    setMode('phone');
  }
  function closePhone(silent) {
    phone.hide();
    if (!silent && mode === 'phone') setMode('play');
  }

  function buildPauseState() {
    const xp = state?.progression?.respectXP ?? 0;
    const prog = getRankProgress(xp);
    return {
      ...state,
      player: state?.player,
      rank: { name: prog.name, xp, next: prog.next },
      completedMissions: mission.getCompleted(),
      missionGroups: mission.getMissionGroupsWithStatus(),
      mapMarkers: state?.mapMarkers || {},
      minimap: state?.minimap || {},
      playTime: state?.playTime ?? playTimeAccum,
      mission: state?.mission,
      currentObjective: state?.mission?.objective || state?.hud?.objective,
    };
  }
  function buildPhoneState() {
    return {
      ...state,
      districtName: state?.districtName,
      timeOfDay: state?.timeOfDay || '18:42',
      phoneDate: state?.phoneDate || 'FRI · NOV 20',
      phoneNotification: state?.phoneNotification || { from: 'Sasha Lune', text: "Car's at the marina. Don't scratch it." },
      radio: state?.radio,
      ownedCars: state?.ownedCars || [],
    };
  }

  function handleMissionPassed(payload, updatedSave) {
    if (overlay) return;
    overlay = 'missionPassed';
    const r = payload?.reward || {};
    missionPassed.show({ cash: r.money || 0, respect: r.respect || 0 });
    if (!state.notifications) state.notifications = [];
    state.notifications.push({ text: 'MISSION PASSED', tone: 'gold' });
    autoSave();
    // allow next mission to be started by player/progression - auto-start next unlocked
    const completed = mission.getCompleted();
    const next = ALL_MISSIONS.find(m => !completed.includes(m.id) && (m.unlockRequires || []).every(id => completed.includes(id)));
    setTimeout(() => { if (!mission.getRunner().isActive() && next && mode === 'play') mission.startMission(next.id, completed); }, 4200);
    setTimeout(() => { if (overlay === 'missionPassed') { missionPassed.hide(); overlay = null; } }, 4300);
  }

  function showWasted() {
    if (overlay === 'wasted' || overlay === 'busted') return;
    overlay = 'wasted';
    const fee = 500;
    wasted.show({ fee });
  }
  function showBusted() {
    if (overlay === 'wasted' || overlay === 'busted') return;
    overlay = 'busted';
    const fee = 750;
    busted.show({ fee });
  }
  function handleRetry(kind) {
    // attempt to trigger respawn; main.js also has its own respawn timer logic
    if (state) {
      state.player.money = Math.max(0, (state.player.money || 0) - (kind === 'busted' ? 750 : 500));
      if (state.respawn) state.respawn.timer = 0; // let main complete respawn if wired, else do minimal
      // minimal fallback respawn
      if (state.player.health <= 0 || kind === 'wasted' || kind === 'busted') {
        state.player.health = 100; state.player.armour = 0; state.player.wanted = 0;
        state.player.dead = false; state.player.busted = false;
        state.player.x = 0; state.player.z = (state.world?.layout?.depth || 700) / 2 - 35; state.player.y = 0;
        if (state.player.inCar && state.car) { state.car.driver = null; state.player.inCar = null; state.car = null; }
        state.respawn = { state: null, timer: 0, label: '' };
        if (state.police?.clearUnits) state.police.clearUnits();
      }
    }
    wasted.hide(); busted.hide();
    overlay = null;
  }

  function onKeyDown(e) {
    if (e.code === 'KeyH') { checklist.toggle(); return; }
    if (mode === 'title') {
      if (e.code === 'Escape') { controlsCard.hide(); }
      return;
    }
    if (e.code === 'Escape') {
      if (controlsCard.el && !controlsCard.el.classList.contains('hh-hidden')) { controlsCard.hide(); return; }
      if (mode === 'pause') closePause(); else if (mode === 'phone') closePhone(); else if (mode === 'play' && !overlay) openPause();
      return;
    }
    if (e.code === 'KeyP') {
      if (mode === 'phone') closePhone(); else if (mode === 'play' && !overlay) openPhone();
      return;
    }
    if (e.code === 'KeyR') {
      audio.switchRadio();
      // HUD toast will update via state.radio
      return;
    }
  }
  window.addEventListener('keydown', onKeyDown);

  function handleEnter(consumed) {
    // called by main.js integration when F/enter is consumed; lets activities claim it
    if (!consumed || mode !== 'play' || overlay) return false;
    if (state) state._flowEnterPressed = true;
    return true;
  }

  function update(dt) {
    lastDt = dt || 0;
    // title mode
    if (mode === 'title') {
      titleCamera.update(dt);
      checklist.update(state);
      return;
    }

    if (state) {
      state.playTime = (state.playTime || 0) + dt;
      playTimeAccum = state.playTime;
    }

    // if paused/phone, keep HUD/overlays reactive but don't run gameplay bridges hard? bridges are cheap
    if (mode === 'pause') {
      pause.update(buildPauseState());
      return;
    }
    if (mode === 'phone') {
      phone.update(buildPhoneState());
      return;
    }

    // play mode
    if (!overlay) {
      mission.update(dt, state);
      activity.update(dt, state);
    }
    audio.update(dt, state);

    // intro dialogue expiry (don't stomp mission dialogue while active)
    if (introDialogueUntil) {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      if (now > introDialogueUntil) {
        introDialogueUntil = 0;
        if (state?.dialogue && state.dialogue.speaker === 'Mama Inés' && /came back to Port Solenne/.test(state.dialogue.text || '')) {
          state.dialogue = { ...state.dialogue, visible: false };
        }
      }
    }

    // detect wasted/busted from state
    const rs = state?.respawn?.state || (state?.player?.health <= 0 ? 'wasted' : null);
    if (rs === 'wasted' && lastRespawnState !== 'wasted') showWasted();
    if (rs === 'busted' && lastRespawnState !== 'busted') showBusted();
    lastRespawnState = rs;

    // mission passed handled via callback; also detect external flag
    if (state?.missionPassedFlag && overlay !== 'missionPassed') {
      handleMissionPassed({ reward: state.missionPassedFlag.reward || state.missionPassedFlag });
      state.missionPassedFlag = null;
    }
  }

  // initialize on title
  goToTitle();

  return {
    update,
    isPlaying,
    openPause,
    openPhone,
    handleEnter,
    titleCamera,
    audio,
    mission,
    activity,
    get mode() { return mode; },
  };
}
