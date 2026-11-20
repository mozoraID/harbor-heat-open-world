// Car engine sound: oscillators and filtered noise driven by RPM.
import { getContext, getChannel, unlock } from './audioEngine.js';

export function createEngineSound() {
  let ctx = null, started = false;
  let osc1, osc2, noise, noiseFilter, noiseGain, mix, lpf;
  let targetRpm = 800, curRpm = 800, on = false;

  function setup() {
    ctx = getContext();
    if (!ctx || started) return;
    const dest = getChannel('engine');
    mix = ctx.createGain(); mix.gain.value = 0.0;
    lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 600; lpf.Q.value = 0.7;

    osc1 = ctx.createOscillator(); osc1.type = 'sawtooth';
    const g1 = ctx.createGain(); g1.gain.value = 0.18;
    osc2 = ctx.createOscillator(); osc2.type = 'triangle';
    const g2 = ctx.createGain(); g2.gain.value = 0.12;
    osc1.connect(g1); g1.connect(lpf);
    osc2.connect(g2); g2.connect(lpf);

    // filtered noise for grit
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1);
    noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    noiseFilter = ctx.createBiquadFilter(); noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 400; noiseFilter.Q.value = 1.2;
    noiseGain = ctx.createGain(); noiseGain.gain.value = 0.06;
    noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(lpf);

    lpf.connect(mix); mix.connect(dest);
    osc1.start(); osc2.start(); noise.start();
    started = true;
  }

  function setRpm(rpm) { targetRpm = Math.max(700, Math.min(8000, Number(rpm) || 800)); }
  function setOn(v) { on = !!v; }

  function update(dt = 0.016, params = {}) {
    if (params.rpm != null) setRpm(params.rpm);
    if (params.on != null) setOn(params.on);
    if (!started) { if (on) setup(); else return; }
    if (!ctx) return;
    const k = 1 - Math.pow(0.001, dt);
    curRpm += (targetRpm - curRpm) * k;
    const freq = 30 + curRpm / 30;
    const t = ctx.currentTime;
    osc1.frequency.setTargetAtTime(freq, t, 0.05);
    osc2.frequency.setTargetAtTime(freq * 2.01, t, 0.05);
    lpf.frequency.setTargetAtTime(300 + curRpm * 0.25, t, 0.06);
    noiseFilter.frequency.setTargetAtTime(200 + curRpm * 0.15, t, 0.08);
    mix.gain.setTargetAtTime(on ? 0.9 : 0.0, t, 0.08);
  }

  function stop() { if (mix && ctx) mix.gain.setTargetAtTime(0, ctx.currentTime, 0.05); on = false; }

  return { update, setRpm, setOn, stop };
}
