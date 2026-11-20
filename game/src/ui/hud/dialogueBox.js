// Dialogue box with procedural canvas portrait, speaker/role, and typewriter text.
import { el, seeded } from './utils.js';

const CHAR_PROFILES = {
  'Mama Inés':         { skin:'#c68642', hair:'#1b1b1b', hairStyle:'bun',    eyes:'#2b1d0e', mouth:'warm',  acc:'earrings', role:'Fixer Matriarch' },
  'Teo "Wrench" Okafor': { skin:'#6b3f2a', hair:'#2a1f1a', hairStyle:'short',  eyes:'#3a2a1a', mouth:'grin',  acc:'goggles',  role:'Mechanic' },
  'Sasha Lune':        { skin:'#f1c27d', hair:'#4fd1ff', hairStyle:'long',   eyes:'#1f6f78', mouth:'smirk', acc:'scar',     role:'Getaway Artist' },
  'Victor Kade':       { skin:'#e0ac69', hair:'#d9d9d9', hairStyle:'slick',  eyes:'#445566', mouth:'stern', acc:'glasses',  role:'Harbor Kingpin' },
  'Rio Vance':         { skin:'#8d5524', hair:'#111111', hairStyle:'fade',   eyes:'#5b3a29', mouth:'calm',  acc:'chain',    role:'Street Broker' },
};

function profileFor(name, seedKey) {
  const base = CHAR_PROFILES[name] || {};
  const r = seeded(seedKey || name || 'anon');
  const skins = ['#f1c27d','#e0ac69','#c68642','#8d5524','#6b3f2a'];
  const hairs = ['#1b1b1b','#3b2f2f','#6b4c3b','#d9d9d9','#4fd1ff','#ff6b5a'];
  const styles = ['short','long','bun','slick','fade'];
  const mouths = ['warm','grin','smirk','stern','calm'];
  const accs = ['none','earrings','goggles','scar','glasses','chain'];
  return {
    skin: base.skin || skins[Math.floor(r()*skins.length)],
    hair: base.hair || hairs[Math.floor(r()*hairs.length)],
    hairStyle: base.hairStyle || styles[Math.floor(r()*styles.length)],
    eyes: base.eyes || '#2b1d0e',
    mouth: base.mouth || mouths[Math.floor(r()*mouths.length)],
    acc: base.acc || accs[Math.floor(r()*accs.length)],
    role: base.role || 'Contact',
  };
}

function drawPortrait(canvas, name, seedKey) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const p = profileFor(name, seedKey);
  ctx.clearRect(0,0,w,h);
  // bg
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#223044'); g.addColorStop(1,'#0f141d');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  // neck/shoulders
  ctx.fillStyle = p.skin;
  ctx.fillRect(28,56,16,12);
  ctx.fillStyle = '#334';
  ctx.beginPath(); ctx.ellipse(36,76,26,14,0,Math.PI,0); ctx.fill();
  // head
  ctx.fillStyle = p.skin;
  ctx.beginPath(); ctx.ellipse(36,38,18,20,0,0,Math.PI*2); ctx.fill();
  // hair
  ctx.fillStyle = p.hair;
  if (p.hairStyle === 'long') {
    ctx.beginPath(); ctx.ellipse(36,30,20,16,0,Math.PI,0); ctx.fill();
    ctx.fillRect(16,30,8,28); ctx.fillRect(48,30,8,28);
  } else if (p.hairStyle === 'bun') {
    ctx.beginPath(); ctx.ellipse(36,28,19,14,0,Math.PI,0); ctx.fill();
    ctx.beginPath(); ctx.arc(36,14,8,0,Math.PI*2); ctx.fill();
  } else if (p.hairStyle === 'slick') {
    ctx.beginPath(); ctx.ellipse(34,28,19,13,0.2,Math.PI,0); ctx.fill();
  } else if (p.hairStyle === 'fade') {
    ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.ellipse(36,28,18,12,0,Math.PI,0); ctx.fill(); ctx.globalAlpha = 1;
  } else {
    ctx.beginPath(); ctx.ellipse(36,28,19,14,0,Math.PI,0); ctx.fill();
  }
  // eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(29,38,4,3,0,0,Math.PI*2); ctx.ellipse(43,38,4,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = p.eyes;
  ctx.beginPath(); ctx.arc(29,38,1.8,0,Math.PI*2); ctx.arc(43,38,1.8,0,Math.PI*2); ctx.fill();
  // mouth
  ctx.strokeStyle = '#5a2d2d'; ctx.lineWidth = 2; ctx.beginPath();
  if (p.mouth === 'grin') ctx.arc(36,46,6,0.15*Math.PI,0.85*Math.PI);
  else if (p.mouth === 'smirk') { ctx.moveTo(31,47); ctx.quadraticCurveTo(36,49,41,45); }
  else if (p.mouth === 'stern') { ctx.moveTo(31,48); ctx.lineTo(41,48); }
  else if (p.mouth === 'calm') { ctx.moveTo(31,47); ctx.lineTo(41,47); }
  else ctx.arc(36,45,5,0.15*Math.PI,0.85*Math.PI);
  ctx.stroke();
  // accessories
  ctx.strokeStyle = '#ffcc4d'; ctx.fillStyle = '#ffcc4d'; ctx.lineWidth = 2;
  if (p.acc === 'earrings') { ctx.beginPath(); ctx.arc(18,44,2,0,Math.PI*2); ctx.arc(54,44,2,0,Math.PI*2); ctx.fill(); }
  else if (p.acc === 'goggles') { ctx.strokeStyle='#5cc8ff'; ctx.strokeRect(22,34,10,8); ctx.strokeRect(40,34,10,8); ctx.beginPath(); ctx.moveTo(32,38); ctx.lineTo(40,38); ctx.stroke(); }
  else if (p.acc === 'scar') { ctx.strokeStyle='#ff6b5a'; ctx.beginPath(); ctx.moveTo(44,30); ctx.lineTo(50,44); ctx.stroke(); }
  else if (p.acc === 'glasses') { ctx.strokeStyle='#e8eef7'; ctx.strokeRect(23,34,10,7); ctx.strokeRect(39,34,10,7); ctx.beginPath(); ctx.moveTo(33,37); ctx.lineTo(39,37); ctx.stroke(); }
  else if (p.acc === 'chain') { ctx.strokeStyle='#ffcc4d'; ctx.beginPath(); ctx.arc(36,64,10,0.15*Math.PI,0.85*Math.PI); ctx.stroke(); }
  return p.role;
}

export function createDialogueBox(root) {
  const wrap = el('div', 'hh-panel hh-dialogue hh-accent-gold hh-hidden');
  wrap.innerHTML = `
    <canvas class="hh-portrait" width="72" height="72"></canvas>
    <div style="flex:1;min-width:0;">
      <div><span class="hh-dialogue-name" data-name></span><span class="hh-dialogue-role" data-role></span></div>
      <div class="hh-dialogue-text" data-text></div>
    </div>
  `;
  root.appendChild(wrap);
  const canvas = wrap.querySelector('canvas');
  const nameEl = wrap.querySelector('[data-name]');
  const roleEl = wrap.querySelector('[data-role]');
  const textEl = wrap.querySelector('[data-text]');

  let fullText = '';
  let shown = 0;
  let lastT = performance.now();
  let lastSpeaker = '';

  function update(state) {
    const d = state.dialogue;
    const visible = !!(d && d.visible !== false && (d.text || d.speaker));
    if (!visible) { wrap.classList.add('hh-hidden'); return; }
    wrap.classList.remove('hh-hidden');
    const speaker = d.speaker || d.name || 'Unknown';
    const text = String(d.text || '');
    if (speaker !== lastSpeaker) {
      const pRole = drawPortrait(canvas, speaker, d.seed || speaker);
      lastSpeaker = speaker;
      roleEl.textContent = (d.role || pRole || '').toUpperCase();
    } else if (d.role) {
      roleEl.textContent = String(d.role).toUpperCase();
    }
    nameEl.textContent = speaker;
    if (text !== fullText) { fullText = text; shown = 0; lastT = performance.now(); }
    const now = performance.now();
    const dt = now - lastT;
    lastT = now;
    const speed = d.typeSpeed ?? 45; // chars per second
    if (shown < fullText.length) {
      shown = Math.min(fullText.length, shown + dt * speed / 1000);
    }
    textEl.textContent = fullText.slice(0, Math.floor(shown));
  }
  return { update, el: wrap };
}
