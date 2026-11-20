// Sound effects: gunshots per weapon, explosion, impact, footsteps, UI blips, horn, glass.
import { getContext, getChannel } from './audioEngine.js';

function noiseBuffer(ctx, dur=0.2) {
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate*dur)), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  return buf;
}

function playShot(ctx, dest, opts={}) {
  const t = ctx.currentTime;
  const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, opts.dur||0.15);
  const bp = ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=opts.freq||1200; bp.Q.value=opts.q||0.8;
  const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=opts.lp||4000;
  const g = ctx.createGain(); g.gain.setValueAtTime(opts.gain||0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t+(opts.dur||0.15));
  src.connect(bp); bp.connect(lp); lp.connect(g); g.connect(dest);
  src.start(t); src.stop(t+(opts.dur||0.15)+0.02);
  if (opts.tone) {
    const o=ctx.createOscillator(); o.type='triangle'; o.frequency.setValueAtTime(opts.tone, t); o.frequency.exponentialRampToValueAtTime(opts.tone*0.5, t+0.08);
    const og=ctx.createGain(); og.gain.setValueAtTime((opts.gain||0.5)*0.3,t); og.gain.exponentialRampToValueAtTime(0.001,t+0.09);
    o.connect(og); og.connect(dest); o.start(t); o.stop(t+0.1);
  }
}

export function createSfx() {
  function gunshot(weapon='pistol') {
    const ctx = getContext(); if (!ctx) return; const dest = getChannel('sfx');
    const map = {
      pistol: {freq:1500, dur:0.12, gain:0.45, tone:180, lp:3500},
      smg:    {freq:1800, dur:0.08, gain:0.35, tone:220, lp:4500},
      shotgun:{freq:900,  dur:0.22, gain:0.6,  tone:120, lp:2500},
      rifle:  {freq:1400, dur:0.14, gain:0.5,  tone:160, lp:3800},
      fists:  {freq:400,  dur:0.08, gain:0.25, tone:90,  lp:900},
      bat:    {freq:600,  dur:0.12, gain:0.35, tone:110, lp:1400},
    };
    playShot(ctx, dest, map[weapon] || map.pistol);
  }

  function explosion() {
    const ctx=getContext(); if(!ctx) return; const dest=getChannel('sfx'); const t=ctx.currentTime;
    const src=ctx.createBufferSource(); src.buffer=noiseBuffer(ctx,1.2);
    const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.setValueAtTime(800,t); lp.frequency.exponentialRampToValueAtTime(80,t+1.0);
    const g=ctx.createGain(); g.gain.setValueAtTime(0.9,t); g.gain.exponentialRampToValueAtTime(0.001,t+1.1);
    src.connect(lp); lp.connect(g); g.connect(dest); src.start(t); src.stop(t+1.2);
    const o=ctx.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(80,t); o.frequency.exponentialRampToValueAtTime(20,t+0.8);
    const og=ctx.createGain(); og.gain.setValueAtTime(0.7,t); og.gain.exponentialRampToValueAtTime(0.001,t+0.9);
    o.connect(og); og.connect(dest); o.start(t); o.stop(t+1.0);
  }

  function impact() {
    const ctx=getContext(); if(!ctx) return; const dest=getChannel('sfx'); const t=ctx.currentTime;
    const src=ctx.createBufferSource(); src.buffer=noiseBuffer(ctx,0.18);
    const bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=500; bp.Q.value=1.2;
    const g=ctx.createGain(); g.gain.setValueAtTime(0.4,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.16);
    src.connect(bp); bp.connect(g); g.connect(dest); src.start(t); src.stop(t+0.2);
  }

  function footsteps(surface='concrete') {
    const ctx=getContext(); if(!ctx) return; const dest=getChannel('sfx'); const t=ctx.currentTime;
    const f = surface==='metal'?1200: surface==='grass'?500:800;
    const src=ctx.createBufferSource(); src.buffer=noiseBuffer(ctx,0.08);
    const bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=f; bp.Q.value=1.5;
    const g=ctx.createGain(); g.gain.setValueAtTime(0.18,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.07);
    src.connect(bp); bp.connect(g); g.connect(dest); src.start(t); src.stop(t+0.09);
  }

  function uiBlip(type='select') {
    const ctx=getContext(); if(!ctx) return; const dest=getChannel('ui'); const t=ctx.currentTime;
    const o=ctx.createOscillator(); o.type='sine';
    const freq = type==='confirm'?880: type==='back'?440:660;
    o.frequency.setValueAtTime(freq,t); if(type==='confirm') o.frequency.setValueAtTime(1320,t+0.06);
    const g=ctx.createGain(); g.gain.setValueAtTime(0.18,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t+0.14);
  }

  function horn() {
    const ctx=getContext(); if(!ctx) return; const dest=getChannel('sfx'); const t=ctx.currentTime;
    [340, 420].forEach(f=>{ const o=ctx.createOscillator(); o.type='square'; o.frequency.value=f; const g=ctx.createGain(); g.gain.setValueAtTime(0.18,t); g.gain.setValueAtTime(0.18,t+0.25); g.gain.exponentialRampToValueAtTime(0.001,t+0.35); const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1200; o.connect(lp); lp.connect(g); g.connect(dest); o.start(t); o.stop(t+0.36); });
  }

  function glass() {
    const ctx=getContext(); if(!ctx) return; const dest=getChannel('sfx'); const t=ctx.currentTime;
    for(let i=0;i<5;i++){ const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=2000+Math.random()*3000; const g=ctx.createGain(); const st=t+Math.random()*0.05; g.gain.setValueAtTime(0.08,st); g.gain.exponentialRampToValueAtTime(0.001,st+0.15+Math.random()*0.2); o.connect(g); g.connect(dest); o.start(st); o.stop(st+0.4); }
    const src=ctx.createBufferSource(); src.buffer=noiseBuffer(ctx,0.25); const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=2500; const g=ctx.createGain(); g.gain.setValueAtTime(0.2,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.22); src.connect(hp); hp.connect(g); g.connect(dest); src.start(t); src.stop(t+0.26);
  }

  return { gunshot, explosion, impact, footsteps, uiBlip, horn, glass };
}
