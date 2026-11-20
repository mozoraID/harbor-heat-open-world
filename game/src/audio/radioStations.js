// Three original procedural radio stations with sequencers, invented songs, and DJ jingles.
import { getContext, getChannel } from './audioEngine.js';

function midi(n){ return 440 * Math.pow(2, (n-69)/12); }
function seqStep(ctx, time, nodes, dest) { /* helper not needed; per-station */ }

function createStation(def) {
  let ctx, masterG, playing=false, step=0, timer=null, songIdx=0;
  let nodes = [];
  const bpm = def.bpm;
  const stepDur = 60 / bpm / 4; // 16th notes
  const songs = def.songs;

  function currentSong() { return songs[songIdx % songs.length]; }

  function start(outChannel) {
    ctx = getContext(); if (!ctx) return;
    stop();
    masterG = ctx.createGain(); masterG.gain.value = 0.8; masterG.connect(outChannel || getChannel('radio'));
    playing = true; step = 0;
    schedule();
  }

  function schedule() {
    if (!playing || !ctx) return;
    const ahead = 0.12;
    while (nodes.length && nodes[0].t < ctx.currentTime - 0.2) nodes.shift();
    const base = ctx.currentTime + 0.02;
    for (let i=0;i<4;i++) { // schedule a few steps
      const t = base + i*stepDur;
      def.scheduleStep(ctx, masterG, t, step + i, currentSong());
    }
    step += 4;
    // change song occasionally
    if (step % 256 === 0) songIdx = (songIdx + 1) % songs.length;
    timer = setTimeout(schedule, stepDur * 2 * 1000);
  }

  function stop() {
    playing = false;
    if (timer) clearTimeout(timer); timer = null;
    if (masterG && ctx) { try { masterG.gain.setTargetAtTime(0, ctx.currentTime, 0.05); } catch{} }
    masterG = null; nodes = [];
  }

  function nextSong() { songIdx = (songIdx + 1) % songs.length; return currentSong(); }

  function playJingle(outChannel) {
    const c = getContext(); if (!c) return; const g = c.createGain(); g.gain.value=0.5; g.connect(outChannel || getChannel('radio'));
    const t = c.currentTime; [880, 1108, 1320].forEach((f,i)=>{ const o=c.createOscillator(); o.type='sine'; o.frequency.value=f; const og=c.createGain(); og.gain.setValueAtTime(0.0001,t+i*0.12); og.gain.linearRampToValueAtTime(0.25,t+i*0.12+0.02); og.gain.exponentialRampToValueAtTime(0.001,t+i*0.12+0.18); o.connect(og); og.connect(g); o.start(t+i*0.12); o.stop(t+i*0.12+0.2); });
  }

  return {
    id: def.id, name: def.name, genre: def.genre, songs,
    start, stop, nextSong, currentSong, playJingle,
  };
}

function note(ctx, dest, t, freq, dur, type='sine', gain=0.12, lp=4000) {
  if (freq <= 0) return;
  const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t+0.01); g.gain.exponentialRampToValueAtTime(0.001, t+dur);
  const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=lp;
  o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+0.02);
}
function drum(ctx, dest, t, kind='kick') {
  if (kind==='kick') {
    const o=ctx.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(40,t+0.12);
    const g=ctx.createGain(); g.gain.setValueAtTime(0.6,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.14);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t+0.16);
  } else if (kind==='snare') {
    const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.12),ctx.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const s=ctx.createBufferSource(); s.buffer=buf; const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1200;
    const g=ctx.createGain(); g.gain.setValueAtTime(0.25,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
    s.connect(hp); hp.connect(g); g.connect(dest); s.start(t); s.stop(t+0.13);
  } else { // hat
    const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.04),ctx.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const s=ctx.createBufferSource(); s.buffer=buf; const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=6000;
    const g=ctx.createGain(); g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.04);
    s.connect(hp); hp.connect(g); g.connect(dest); s.start(t); s.stop(t+0.05);
  }
}

const wave = createStation({
  id:'wave', name:'WAVE 101.7', genre:'Coastline Pop', bpm:118,
  songs:[{title:'Neon Shoreline'},{title:'Sunset Drive-Thru'},{title:'Palms in Stereo'},{title:'Boardwalk Hearts'}],
  scheduleStep(ctx,dest,t,step,song){
    const bar = Math.floor(step/16)%4; const s = step%16;
    // upbeat major-key synth pop (C major)
    const prog = [[60,64,67],[57,60,64],[53,57,60],[55,59,62]][bar];
    if (s%4===0) prog.forEach(n=>note(ctx,dest,t,midi(n),0.35,'sawtooth',0.06,2500));
    const lead=[72,74,76,79,76,74,72,0,76,79,81,79,76,74,72,0][s];
    if (lead) note(ctx,dest,t,midi(lead),0.18,'triangle',0.09,5000);
    if (s%4===0) drum(ctx,dest,t,'kick');
    if (s%8===4) drum(ctx,dest,t,'snare');
    if (s%2===0) drum(ctx,dest,t,'hat');
    if (s%8===0) note(ctx,dest,t,midi(prog[0]-24),0.3,'square',0.07,800);
  }
});

const krush = createStation({
  id:'krush', name:'KRUSH 94.2', genre:'Synth Nights', bpm:100,
  songs:[{title:'Midnight Artery'},{title:'Chrome Reverie'},{title:'Violet Static'},{title:'Afterglow Loop'}],
  scheduleStep(ctx,dest,t,step,song){
    const bar=Math.floor(step/16)%4; const s=step%16;
    // minor arpeggios (A minor)
    const roots=[57,53,55,52][bar]; // Am F G Em roots
    const arp=[0,3,7,12,7,3,0,3,7,12,15,12,7,3,7,12];
    note(ctx,dest,t,midi(roots+arp[s]),0.18,'sawtooth',0.07,2200);
    if (s%8===0) [0,3,7].forEach(i=>note(ctx,dest,t,midi(roots+i),0.6,'triangle',0.05,1400));
    if (s%8===0) drum(ctx,dest,t,'kick');
    if (s%8===4) drum(ctx,dest,t,'snare');
    if (s%4===2) drum(ctx,dest,t,'hat');
    if (s%4===0) note(ctx,dest,t,midi(roots-12),0.35,'sine',0.08,400);
  }
});

const salt = createStation({
  id:'salt', name:'SALT FM', genre:'Dock Funk', bpm:108,
  songs:[{title:'Crane Swinger'},{title:'Freight & Honey'},{title:'Pier Pressure'},{title:'Rustbelt Strut'}],
  scheduleStep(ctx,dest,t,step,song){
    const bar=Math.floor(step/16)%4; const s=step%16;
    // bassline and drums, E minor funk
    const bass=[40,0,40,43,0,45,0,43, 40,0,40,47,0,45,43,0];
    if (bass[s]) note(ctx,dest,t,midi(bass[s]),0.18,'square',0.1,700);
    const stab = (s===0||s===6||s===10)?[52,55,59,62]:null;
    if (stab) stab.forEach(n=>note(ctx,dest,t,midi(n),0.12,'sawtooth',0.05,1800));
    if (s===0||s===6||s===10) drum(ctx,dest,t,'kick');
    if (s===4||s===12) drum(ctx,dest,t,'snare');
    if (s%2===0) drum(ctx,dest,t,'hat');
  }
});

export const stations = [wave, krush, salt];
export function getStation(index){ return stations[((index%stations.length)+stations.length)%stations.length]; }
export function getStationById(id){ return stations.find(s=>s.id===id) || stations[0]; }
