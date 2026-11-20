// Audio bridge: unlock, engine/siren/sfx/radio driven by game state.
import { initUnlockOnFirstInput, unlock, applySettings } from '../audio/audioEngine.js';
import { createEngineSound } from '../audio/engineSound.js';
import { createSiren } from '../audio/siren.js';
import { createSfx } from '../audio/sfx.js';
import { createRadio } from '../audio/radio.js';
import { loadSettings } from '../save/settings.js';

export function createAudioBridge(ctx = {}) {
  initUnlockOnFirstInput();
  applySettings(loadSettings());

  const engine = createEngineSound();
  const siren = createSiren();
  const sfx = createSfx();
  const radio = createRadio({
    onChange: (info) => {
      if (ctx.state) ctx.state.radio = { station: info.station, genre: info.genre, track: info.track, visible: true, index: info.index, id: info.id };
    }
  });

  // seed radio state
  if (ctx.state) {
    const info = radio.getState();
    ctx.state.radio = { station: info.station, genre: info.genre, track: info.track, visible: true, index: info.index, id: info.id };
  }

  let lastInCar = false;
  let radioStarted = false;
  let prevShotSig = 0;
  let prevExplosionSig = 0;
  let prevWanted = 0;

  function distToNearestPolice(state) {
    const units = state.police?.units?.cars;
    if (!Array.isArray(units)) return Infinity;
    const px = state.player?.x || 0, pz = state.player?.z || 0;
    let best = Infinity;
    for (const c of units) {
      if (!c || c.dead || !c.mesh) continue;
      const dx = c.mesh.position.x - px, dz = c.mesh.position.z - pz;
      const d = Math.sqrt(dx*dx + dz*dz);
      if (d < best) best = d;
    }
    return best;
  }

  function detectEvents(state) {
    // Gunshot heuristics: explicit counters/timestamps/flags from other systems
    const shotSig = Number(state.combat?.shotsFired || 0) + Number(state.stats?.shotsFired || 0) + Number(state.lastShotTime || 0);
    const shotFlag = state.shotFired || state.gunshot || state.combat?.shotFired;
    if ((shotSig && shotSig !== prevShotSig) || (shotFlag && !detectEvents._shotFlag)) {
      const w = state.player?.activeWeapon;
      const name = w === 3 ? 'pistol' : w === 4 ? 'smg' : w === 5 ? 'shotgun' : w === 6 ? 'rifle' : 'pistol';
      sfx.gunshot(state.combat?.lastWeapon || state.lastWeapon || name);
    }
    prevShotSig = shotSig;
    detectEvents._shotFlag = !!shotFlag;

    const expSig = Number(state.effects?.explosionCount || 0) + Number(state.stats?.explosions || 0) + Number(state.lastExplosionTime || 0);
    const expFlag = state.explosion || state.effects?.explosion;
    if ((expSig && expSig !== prevExplosionSig) || (expFlag && !detectEvents._expFlag)) {
      sfx.explosion();
    }
    prevExplosionSig = expSig;
    detectEvents._expFlag = !!expFlag;
  }

  function update(dt, state = ctx.state) {
    if (!state) return;
    const inCar = !!(state.player && state.player.inCar);
    const speed = inCar ? Math.abs(state.car?.speed || state.speed || 0) : 0;
    const rpm = 800 + speed * 140 + (inCar ? 400 : 0);
    engine.update(dt, { rpm, on: inCar });

    // Radio audible in car
    if (inCar && !lastInCar) {
      unlock();
      if (!radioStarted) { radio.music.play(radio.getState().index || 0); radioStarted = true; }
    }
    if (!inCar && lastInCar) {
      // keep station selected but stop playback so it's "in car"
      radio.music.stop();
      radioStarted = false;
    }
    lastInCar = inCar;

    // Siren when police near or wanted
    const wanted = state.player?.wanted || 0;
    const near = distToNearestPolice(state);
    const sirenOn = wanted >= 1 && near < 140;
    const mode = wanted >= 3 ? 'yelp' : 'wail';
    siren.update({ on: sirenOn, mode });
    prevWanted = wanted;

    detectEvents(state);
  }

  function notifyShot(weapon) { sfx.gunshot(weapon || 'pistol'); }
  function notifyExplosion() { sfx.explosion(); }
  function notifyImpact() { sfx.impact(); }
  function notifyHorn() { sfx.horn(); }

  function switchRadio() { return radio.switchStation(1); }
  function setRadio(index) { return radio.setStation(index); }
  function getRadio() { return radio; }

  return { update, radio, engine, siren, sfx, notifyShot, notifyExplosion, notifyImpact, notifyHorn, switchRadio, setRadio, getRadio };
}
