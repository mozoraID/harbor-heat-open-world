// Radio controller: switch with R, emits station/song for HUD toast.
import { createMusic } from './music.js';
import { initUnlockOnFirstInput, unlock, getContext } from './audioEngine.js';

export function createRadio(callbacks = {}) {
  initUnlockOnFirstInput();
  let lastEmit = null;
  const music = createMusic((info) => {
    lastEmit = info;
    callbacks.onChange && callbacks.onChange(info);
  });

  function switchStation(dir = 1) {
    unlock();
    music.next();
    const info = music.getCurrent();
    callbacks.onChange && callbacks.onChange(info);
    return info;
  }

  function setStation(index) { unlock(); music.play(index); return music.getCurrent(); }
  function getState() { return music.getCurrent(); }

  function handleKey(e) {
    if (e.repeat) return;
    if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
      switchStation(1);
    }
  }

  function bindKeys() { window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey); }

  return { switchStation, setStation, getState, bindKeys, music };
}
