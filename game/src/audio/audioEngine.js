// Audio engine: single AudioContext, master/channel gains, unlock on first input.
import { loadSettings } from '../save/settings.js';

let ctx = null;
let master = null;
const channels = {};
let unlocked = false;

const CHANNELS = ['masterVol', 'music', 'sfx', 'engine', 'ui', 'radio'];

export function getContext() { return ctx; }
export function getMaster() { return master; }
export function getChannel(name) { return channels[name] || master; }

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(ctx.destination);
  for (const name of ['music', 'sfx', 'engine', 'ui', 'radio']) {
    const g = ctx.createGain();
    g.gain.value = 0.7;
    g.connect(master);
    channels[name] = g;
  }
  applySettings(loadSettings());
  return ctx;
}

export function applySettings(settings) {
  if (!settings) return;
  if (master && settings.volume) {
    if (settings.volume.master != null) master.gain.value = settings.volume.master;
    for (const k of ['music', 'sfx', 'engine', 'ui', 'radio']) {
      if (channels[k] && settings.volume[k] != null) channels[k].gain.value = settings.volume[k];
    }
  }
}

export function unlock() {
  ensure();
  if (!ctx) return Promise.resolve(null);
  if (ctx.state === 'suspended') ctx.resume();
  if (!unlocked) {
    unlocked = true;
    // silent blip to fully unlock on iOS/Chrome policies
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain(); g.gain.value = 0.0001;
      o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + 0.01);
    } catch {}
  }
  return Promise.resolve(ctx);
}

export function initUnlockOnFirstInput() {
  const handler = () => { unlock(); window.removeEventListener('pointerdown', handler); window.removeEventListener('keydown', handler); window.removeEventListener('touchstart', handler); };
  window.addEventListener('pointerdown', handler, { once: true });
  window.addEventListener('keydown', handler, { once: true });
  window.addEventListener('touchstart', handler, { once: true });
}

export function now() { return ctx ? ctx.currentTime : 0; }

export function createEngine() { ensure(); return ctx; }
