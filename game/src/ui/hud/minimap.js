// Round rotating minimap with roads, blocks, water, beach/ocean, district labels, blips, and compass ring.
import { el, clamp } from './utils.js';

const DISTRICT_LABELS = [
  { name: 'Marigold Beach', x: 0, z: 360 },
  { name: 'Old Pier', x: -300, z: 280 },
  { name: 'Lagoon Bridge', x: 90, z: 250 },
  { name: 'Glasswater Heights', x: 180, z: 20 },
  { name: 'Ferro Docks', x: -250, z: -260 },
  { name: 'Cinder Hills', x: 220, z: -250 },
];

export function createMinimap(root) {
  const wrap = el('div', 'hh-minimap-wrap');
  const canvas = document.createElement('canvas');
  canvas.width = 408; canvas.height = 408;
  canvas.className = 'hh-minimap';
  const label = el('div', 'hh-district-label', 'MARIGOLD BEACH');
  wrap.append(canvas, label);
  root.appendChild(wrap);
  const ctx = canvas.getContext('2d');
  let mapData = { roads: [], blocks: [], water: [], districts: null, labels: null };
  let flash = 0;

  function setMapData(data) {
    if (!data) return;
    mapData = {
      roads: Array.isArray(data.roads) ? data.roads : [],
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      water: Array.isArray(data.water) ? data.water : [],
      districts: Array.isArray(data.districts) ? data.districts : (Array.isArray(data.labels) ? data.labels : null),
    };
  }

  function rect(r) {
    if (!r) return { x: 0, z: 0, w: 20, h: 20 };
    if (r.w != null) return { x: r.x || 0, z: r.z || 0, w: r.w, h: r.h ?? r.d ?? r.w };
    if (r.width != null) return { x: r.x || 0, z: r.z || 0, w: r.width, h: r.height ?? r.depth ?? r.width };
    if (r.x1 != null) return { x: (r.x1 + r.x2) / 2, z: (r.z1 + r.z2) / 2, w: Math.abs(r.x2 - r.x1), h: Math.abs(r.z2 - r.z1) };
    const s = r.size ?? 20;
    return { x: r.x || 0, z: r.z || 0, w: s, h: s };
  }

  function worldToMap(wx, wz, px, pz, scale) {
    return { x: (wx - px) * scale, y: (wz - pz) * scale };
  }

  function update(state, now = performance.now()) {
    const w = canvas.width, h = canvas.height, r = w / 2 - 14;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);

    // clip circle
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#10283f'; // deep ocean base
    ctx.fillRect(-r, -r, w, h);

    const px = state.player?.x ?? 0;
    const pz = state.player?.z ?? 0;
    const heading = (state.player?.inCar && state.car?.yaw != null) ? state.car.yaw : (state.player?.yaw ?? 0);
    const scale = 0.5; // px per world meter
    const mapRotation = heading + Math.PI;
    const cosR = Math.cos(mapRotation), sinR = Math.sin(mapRotation);
    const uprightLabels = [];
    function rotatedPoint(p) {
      return { x: p.x * cosR - p.y * sinR, y: p.x * sinR + p.y * cosR };
    }

    // beach sand hint band (south, large +z in world) drawn in world space then rotated
    ctx.save();
    ctx.rotate(mapRotation);
    // subtle sand area
    ctx.fillStyle = '#cdb176';
    ctx.globalAlpha = 0.22;
    const sand = worldToMap(0, 360, px, pz, scale);
    ctx.fillRect(-r * 1.6, sand.y - 40 * scale, r * 3.2, 220 * scale);
    ctx.globalAlpha = 1;

    // water
    ctx.fillStyle = '#1c6fae';
    for (const item of mapData.water) {
      const rc = rect(item);
      const p = worldToMap(rc.x - rc.w / 2, rc.z - rc.h / 2, px, pz, scale);
      ctx.fillRect(p.x, p.y, rc.w * scale, rc.h * scale);
    }
    // blocks
    for (const item of mapData.blocks) {
      const rc = rect(item);
      const p = worldToMap(rc.x - rc.w / 2, rc.z - rc.h / 2, px, pz, scale);
      const isBeach = rc.z > 240;
      ctx.fillStyle = isBeach ? '#7a6a45' : '#324155';
      ctx.fillRect(p.x, p.y, rc.w * scale, rc.h * scale);
      ctx.strokeStyle = isBeach ? '#9a8658' : '#4a607a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x, p.y, rc.w * scale, rc.h * scale);
    }
    // roads (thicker, coloured)
    for (const item of mapData.roads) {
      const rc = rect(item);
      const p = worldToMap(rc.x - rc.w / 2, rc.z - rc.h / 2, px, pz, scale);
      const main = Math.max(rc.w, rc.h) > 200;
      ctx.fillStyle = main ? '#6b7a8f' : '#596777';
      ctx.fillRect(p.x, p.y, rc.w * scale, rc.h * scale);
      if (main) {
        ctx.strokeStyle = 'rgba(255,230,140,0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x + 1, p.y + 1, Math.max(0, rc.w * scale - 2), Math.max(0, rc.h * scale - 2));
      }
    }

    // district labels are drawn upright after the map transform is restored
    const labels = mapData.districts && mapData.districts.length ? mapData.districts : DISTRICT_LABELS;
    for (const d of labels) {
      const dx = Number(d.x ?? 0), dz = Number(d.z ?? 0);
      const p = worldToMap(dx, dz, px, pz, scale);
      if (p.x * p.x + p.y * p.y > (r - 10) * (r - 10)) continue;
      const name = String(d.name || d.label || '').toUpperCase();
      const rp = rotatedPoint(p);
      uprightLabels.push({ text: name, x: rp.x, y: rp.y, kind: 'district' });
    }

    // mission target
    const mm = state.minimap || {};
    if (mm.target) {
      const tp = worldToMap(mm.target.x, mm.target.z, px, pz, scale);
      if (tp.x * tp.x + tp.y * tp.y < (r + 20) * (r + 20)) {
        ctx.fillStyle = '#ffcc4d';
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(tp.x, tp.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }
    // shops
    if (Array.isArray(mm.shops)) {
      for (const s of mm.shops) {
        const sp = worldToMap(s.x, s.z, px, pz, scale);
        if (sp.x * sp.x + sp.y * sp.y < r * r) {
          const rp = rotatedPoint(sp);
          uprightLabels.push({ text: String(s.letter || s.label || 'S'), x: rp.x, y: rp.y, kind: 'shop' });
        }
      }
    }
    // police
    flash = (now / 220) % 2 < 1;
    if (Array.isArray(mm.police)) {
      for (const p of mm.police) {
        const bp = worldToMap(p.x, p.z, px, pz, scale);
        if (bp.x * bp.x + bp.y * bp.y > r * r) continue;
        const ang = p.yaw ?? p.heading ?? 0;
        // vision cone
        ctx.save();
        ctx.translate(bp.x, bp.y); ctx.rotate(ang + mapRotation);
        ctx.fillStyle = flash ? 'rgba(255,70,70,0.22)' : 'rgba(80,160,255,0.22)';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 34, -0.42, 0.42); ctx.closePath(); ctx.fill();
        ctx.restore();
        ctx.fillStyle = flash ? '#ff3b3b' : '#4db8ff';
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(bp.x, bp.y, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore(); // unrotate world

    // text labels stay upright on screen at their rotated map positions
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const l of uprightLabels) {
      const shop = l.kind === 'shop';
      ctx.font = (shop ? '900 16px' : '700 18px') + ' "Segoe UI", Arial';
      ctx.lineWidth = 3; ctx.strokeStyle = shop ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.55)';
      ctx.strokeText(l.text, l.x, l.y);
      ctx.fillStyle = shop ? '#3ee6b0' : 'rgba(240,248,255,0.78)';
      ctx.fillText(l.text, l.x, l.y);
    }

    // player arrow (fixed up/forward)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(8, 9); ctx.lineTo(0, 4); ctx.lineTo(-8, 9); ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.restore(); // clip

    // white ring
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(w / 2, h / 2, r + 2.5, 0, Math.PI * 2); ctx.stroke();

    // compass letters on ring (N rotates with world north)
    const cx = w / 2, cy = h / 2;
    const dirs = [
      { l: 'N', a: heading + Math.PI / 2 },
      { l: 'E', a: heading + Math.PI },
      { l: 'S', a: heading - Math.PI / 2 },
      { l: 'W', a: heading },
    ];
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const d of dirs) {
      const lx = cx + Math.cos(d.a) * (r - 2);
      const ly = cy + Math.sin(d.a) * (r - 2);
      const isN = d.l === 'N';
      ctx.font = (isN ? '900 22px' : '800 16px') + ' "Segoe UI", Arial';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.strokeText(d.l, lx, ly);
      ctx.fillStyle = isN ? '#ffcc4d' : '#e8eef7';
      ctx.fillText(d.l, lx, ly);
    }

    label.textContent = String(state.districtName || 'PORT SOLENNE').toUpperCase();
  }

  return { update, el: wrap, setMapData };
}
