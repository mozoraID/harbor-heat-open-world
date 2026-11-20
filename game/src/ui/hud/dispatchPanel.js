// SHP Dispatch panel: unit rows with canvas icons, alternating shading, tags, and roadblock footer.
import { el } from './utils.js';

const TAG_CLASS = {
  RAMMING: 'hh-tag-RAMMING', PIT: 'hh-tag-PIT', FLANKING: 'hh-tag-FLANKING',
  ROADBLOCK: 'hh-tag-ROADBLOCK', SPOTLIGHT: 'hh-tag-SPOTLIGHT',
  PURSUIT: 'hh-tag-PURSUIT', SEARCHING: 'hh-tag-SEARCHING'
};

function inferUnitType(u) {
  if (u && u.type) return String(u.type).toLowerCase();
  const cs = String(u?.callSign || u?.callsign || '').toUpperCase();
  if (cs.startsWith('HERON') || u?.icon === '🚁' || cs.includes('AIR')) return 'helicopter';
  if (cs.startsWith('BULWARK') || u?.tag === 'ROADBLOCK') return 'armoured';
  if (cs.startsWith('MARLIN')) return 'interceptor';
  return 'cruiser';
}

function drawUnitIcon(canvas, type) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (type === 'helicopter') {
    ctx.strokeStyle = '#d7e7ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(2,5); ctx.lineTo(24,5); ctx.stroke();
    ctx.fillStyle = '#5cc8ff';
    ctx.beginPath(); ctx.ellipse(13,11,7,4,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#9fdcff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(20,11); ctx.lineTo(25,8); ctx.lineTo(25,14); ctx.closePath(); ctx.stroke();
  } else if (type === 'armoured') {
    ctx.fillStyle = '#8ea0b5';
    ctx.fillRect(2,6,22,8);
    ctx.fillStyle = '#6f8296';
    ctx.fillRect(6,3,12,5);
    ctx.fillStyle = '#222';
    ctx.fillRect(4,13,5,3); ctx.fillRect(17,13,5,3);
    ctx.strokeStyle = '#c9d3df'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(8,5); ctx.lineTo(4,2); ctx.stroke();
  } else if (type === 'interceptor') {
    ctx.fillStyle = '#4f79ff';
    ctx.beginPath(); ctx.moveTo(3,13); ctx.lineTo(6,7); ctx.lineTo(20,7); ctx.lineTo(23,13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d7e7ff'; ctx.fillRect(9,8,8,3);
    ctx.fillStyle = '#111'; ctx.fillRect(5,12,4,3); ctx.fillRect(17,12,4,3);
    ctx.fillStyle = '#ff4d4d'; ctx.fillRect(10,5,3,2); ctx.fillStyle = '#5cc8ff'; ctx.fillRect(13,5,3,2);
  } else { // cruiser
    ctx.fillStyle = '#e8eef7';
    ctx.beginPath(); ctx.moveTo(2,13); ctx.lineTo(5,8); ctx.lineTo(21,8); ctx.lineTo(24,13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#334'; ctx.fillRect(8,9,10,3);
    ctx.fillStyle = '#111'; ctx.fillRect(4,12,4,3); ctx.fillRect(18,12,4,3);
    ctx.fillStyle = '#ff4d4d'; ctx.fillRect(10,6,3,2); ctx.fillStyle = '#5cc8ff'; ctx.fillRect(13,6,3,2);
  }
}

export function createDispatchPanel(root) {
  const wrap = el('div', 'hh-panel hh-dispatch hh-accent-sky');
  root.appendChild(wrap);

  function update(state) {
    const d = state.dispatch || {};
    const units = Array.isArray(d.units) ? d.units : [];
    const shown = units.slice(0, 5);
    const more = Math.max(0, (d.more ?? (units.length - shown.length)));
    const stars = d.stars ?? state.player?.wanted ?? 0;
    const hasRoadblock = !!(d.roadblock || units.some(u => String(u.tag).toUpperCase() === 'ROADBLOCK'));

    let html = `<div class="hh-dispatch-header hh-caption"><span>SHP DISPATCH</span><span>${units.length} UNITS · ${'★'.repeat(Math.max(0, Math.min(5, stars)))}${'☆'.repeat(Math.max(0, 5 - Math.min(5, stars)))}</span></div>`;
    if (shown.length === 0) {
      html += `<div class="hh-muted" style="font-size:12px;margin-top:4px">NO ACTIVE UNITS</div>`;
    } else {
      html += `<div class="hh-dispatch-rows">`;
      shown.forEach((u, i) => {
        const tag = String(u.tag || 'PURSUIT').toUpperCase();
        const cls = TAG_CLASS[tag] || 'hh-tag-PURSUIT';
        const dist = u.distance != null ? Math.round(u.distance) + 'm' : '--';
        const type = inferUnitType(u);
        html += `<div class="hh-dispatch-row ${i % 2 ? 'alt' : ''}">
          <canvas class="hh-dispatch-icon" width="26" height="18" data-type="${type}"></canvas>
          <span class="hh-dispatch-call">${u.callSign || u.callsign || 'UNIT'}</span>
          <span class="hh-dispatch-dist">${dist}</span>
          <span class="hh-tag ${cls}">${tag}</span>
        </div>`;
      });
      html += `</div>`;
    }
    if (more > 0) html += `<div class="hh-muted" style="font-size:11px;margin-top:4px;padding:0 6px;">+${more} MORE</div>`;
    if (hasRoadblock) html += `<div class="hh-dispatch-footer">ROADBLOCK AHEAD</div>`;

    if (wrap._html !== html) {
      wrap.innerHTML = html;
      wrap._html = html;
      wrap.querySelectorAll('canvas.hh-dispatch-icon').forEach(c => drawUnitIcon(c, c.getAttribute('data-type')));
    }
    wrap.style.display = (d.visible === false) ? 'none' : 'block';
  }
  return { update, el: wrap };
}
