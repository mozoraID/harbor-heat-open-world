// Round rotating minimap with roads, blocks, water, blips, north marker, and district label.
import { el, clamp } from './utils.js';

export function createMinimap(root) {
  const wrap = el('div', 'hh-minimap-wrap');
  const canvas = document.createElement('canvas');
  canvas.width = 340; canvas.height = 340;
  canvas.className = 'hh-minimap';
  const label = el('div', 'hh-district-label', 'MARIGOLD BEACH');
  wrap.append(canvas, label);
  root.appendChild(wrap);
  const ctx = canvas.getContext('2d');
  let mapData = { roads: [], blocks: [], water: [] };
  let flash = 0;

  function setMapData(data) {
    if (!data) return;
    mapData = {
      roads: Array.isArray(data.roads) ? data.roads : [],
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      water: Array.isArray(data.water) ? data.water : [],
    };
  }

  function rect(r) {
    if (r.w != null) return { x: r.x || 0, z: r.z || 0, w: r.w, h: r.h ?? r.d ?? r.w };
    if (r.width != null) return { x: r.x || 0, z: r.z || 0, w: r.width, h: r.height ?? r.depth ?? r.width };
    if (r.x1 != null) return { x: (r.x1 + r.x2) / 2, z: (r.z1 + r.z2) / 2, w: Math.abs(r.x2 - r.x1), h: Math.abs(r.z2 - r.z1) };
    const s = r.size ?? 20;
    return { x: r.x || 0, z: r.z || 0, w: s, h: s };
  }

  function update(state, now = performance.now()) {
    const w = canvas.width, h = canvas.height, r = w / 2 - 8;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#182230';
    ctx.fillRect(-r, -r, w, h);

    const px = state.player?.x ?? 0;
    const pz = state.player?.z ?? 0;
    const heading = (state.player?.inCar && state.car?.yaw != null) ? state.car.yaw : (state.player?.yaw ?? 0);
    const scale = 0.45; // px per world meter

    ctx.save();
    ctx.rotate(-heading);
    // water
    ctx.fillStyle = '#1f4f7a';
    for (const item of mapData.water) {
      const rc = rect(item);
      ctx.fillRect((rc.x - px - rc.w / 2) * scale, (rc.z - pz - rc.h / 2) * scale, rc.w * scale, rc.h * scale);
    }
    // blocks
    ctx.fillStyle = '#2a3544';
    ctx.strokeStyle = '#3b4a5d';
    ctx.lineWidth = 1.5;
    for (const item of mapData.blocks) {
      const rc = rect(item);
      const x = (rc.x - px - rc.w / 2) * scale, z = (rc.z - pz - rc.h / 2) * scale;
      ctx.fillRect(x, z, rc.w * scale, rc.h * scale);
      ctx.strokeRect(x, z, rc.w * scale, rc.h * scale);
    }
    // roads
    ctx.fillStyle = '#4a5666';
    for (const item of mapData.roads) {
      const rc = rect(item);
      ctx.fillRect((rc.x - px - rc.w / 2) * scale, (rc.z - pz - rc.h / 2) * scale, rc.w * scale, rc.h * scale);
    }
    // coastline hint line
    ctx.strokeStyle = '#5cc8ff'; ctx.lineWidth = 2; ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(-r, r*0.6); ctx.lineTo(r, r*0.6); ctx.stroke();
    ctx.globalAlpha = 1;

    // mission target
    const mm = state.minimap || {};
    if (mm.target) {
      const tx = (mm.target.x - px) * scale, tz = (mm.target.z - pz) * scale;
      if (tx*tx+tz*tz < (r+20)*(r+20)) {
        ctx.fillStyle = '#ffcc4d';
        ctx.beginPath(); ctx.arc(tx, tz, 5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
      }
    }
    // shops
    if (Array.isArray(mm.shops)) {
      ctx.font = 'bold 14px "Segoe UI", Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const s of mm.shops) {
        const sx = (s.x - px) * scale, sz = (s.z - pz) * scale;
        if (sx*sx+sz*sz < r*r) {
          ctx.fillStyle = '#3ee6b0';
          ctx.fillText(String(s.letter || s.label || 'S'), sx, sz);
        }
      }
    }
    // police
    flash = (now / 250) % 2 < 1;
    if (Array.isArray(mm.police)) {
      for (const p of mm.police) {
        const bx = (p.x - px) * scale, bz = (p.z - pz) * scale;
        if (bx*bx+bz*bz > r*r) continue;
        const ang = p.yaw ?? p.heading ?? 0;
        // vision cone
        ctx.save();
        ctx.translate(bx, bz); ctx.rotate(ang);
        ctx.fillStyle = flash ? 'rgba(255,80,80,0.18)' : 'rgba(80,140,255,0.18)';
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,26,-0.45,0.45); ctx.closePath(); ctx.fill();
        ctx.restore();
        ctx.fillStyle = flash ? '#ff4d4d' : '#5cc8ff';
        ctx.beginPath(); ctx.arc(bx, bz, 4.5, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.restore(); // unrotate world

    // player arrow (screen-fixed up relative? no, rotating with player heading means world rotates; player arrow should point up in local frame => fixed forward)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(7, 8); ctx.lineTo(0, 4); ctx.lineTo(-7, 8); ctx.closePath();
    ctx.fill(); ctx.stroke();

    // north marker: north in world space rotates with -heading
    const nx = Math.sin(-heading) * (r - 14);
    const nz = -Math.cos(-heading) * (r - 14);
    ctx.fillStyle = '#ffcc4d';
    ctx.font = '900 16px "Segoe UI", Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('N', nx, nz);

    ctx.restore(); // clip
    // border
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(w/2, h/2, r, 0, Math.PI*2); ctx.stroke();

    label.textContent = String(state.districtName || 'PORT SOLENNE').toUpperCase();
  }

  return { update, el: wrap, setMapData };
}
