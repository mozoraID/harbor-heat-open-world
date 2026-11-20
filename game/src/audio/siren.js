// Police siren: wail and yelp modes.
import { getContext, getChannel } from './audioEngine.js';

export function createSiren() {
  let ctx, osc, lfo, lfoGain, gain, filter, started = false, mode = 'wail', on = false;

  function setup() {
    ctx = getContext(); if (!ctx || started) return;
    const dest = getChannel('sfx');
    osc = ctx.createOscillator(); osc.type = 'sawtooth';
    filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1200; filter.Q.value = 2.5;
    gain = ctx.createGain(); gain.gain.value = 0.0;
    lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.8;
    lfoGain = ctx.createGain(); lfoGain.gain.value = 260;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    osc.frequency.value = 700;
    osc.connect(filter); filter.connect(gain); gain.connect(dest);
    osc.start(); lfo.start(); started = true;
  }

  function setMode(m) {
    mode = m === 'yelp' ? 'yelp' : 'wail';
    if (!started || !ctx) return;
    const t = ctx.currentTime;
    if (mode === 'yelp') { lfo.frequency.setTargetAtTime(5.5, t, 0.05); lfoGain.gain.setTargetAtTime(220, t, 0.05); osc.frequency.setValueAtTime(880, t); }
    else { lfo.frequency.setTargetAtTime(0.8, t, 0.05); lfoGain.gain.setTargetAtTime(260, t, 0.05); osc.frequency.setValueAtTime(700, t); }
  }

  function setOn(v) {
    on = !!v;
    if (on && !started) setup();
    if (gain && ctx) gain.gain.setTargetAtTime(on ? 0.22 : 0.0, ctx.currentTime, 0.08);
  }

  function update(params = {}) {
    if (params.mode) setMode(params.mode);
    if (params.on != null) setOn(params.on);
  }

  function stop() { setOn(false); }
  return { update, setMode, setOn, stop };
}
