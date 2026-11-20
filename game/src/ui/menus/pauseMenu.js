// Pause menu: MAP, MISSIONS, STATS, SETTINGS, SAVE tabs.
import { injectMenuStyles } from './menuStyles.js';
import { listSlots, slotDetails } from '../../save/saveSlots.js';
import { loadSettings, saveSettings } from '../../save/settings.js';
import { WORLD, DISTRICTS } from '../../core/constants.js';
import { districtFor } from '../../world/layout.js';

function fmtTime(sec){ const s=Math.max(0,Math.floor(Number(sec)||0)); const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); return h?`${h}h ${m}m`:`${m}m`; }
function fmtMoney(n){ return 'S$ ' + (Math.floor(Number(n)||0)).toLocaleString('en-US'); }

export function createPauseMenu(rootEl, callbacks = {}) {
  injectMenuStyles();
  const root = document.createElement('div');
  root.className = 'hh-menu-root hh-hidden';
  root.innerHTML = `
    <div class="hh-overlay hh-pause">
      <div class="hh-pause-header">
        <div class="hh-pause-title">PAUSED</div>
        <button class="hh-action-btn hh-action-primary" data-resume>Resume</button>
      </div>
      <div class="hh-tabs">
        <div class="hh-tab active" data-tab="map">Map</div>
        <div class="hh-tab" data-tab="missions">Missions</div>
        <div class="hh-tab" data-tab="stats">Stats</div>
        <div class="hh-tab" data-tab="settings">Settings</div>
        <div class="hh-tab" data-tab="save">Save</div>
      </div>
      <div class="hh-tab-content" data-content></div>
    </div>
  `;
  rootEl.appendChild(root);
  const content = root.querySelector('[data-content]');
  let active = 'map';
  let mapData = { roads: [], blocks: [], water: [] };
  let lastState = {};
  let isShown = false;

  function setTab(t) {
    active = t;
    root.querySelectorAll('.hh-tab').forEach(el => el.classList.toggle('active', el.getAttribute('data-tab') === t));
    render();
  }

  root.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { setTab(tab.getAttribute('data-tab')); return; }
    if (e.target.closest('[data-resume]')) { callbacks.onResume && callbacks.onResume(); hide(); }
  });

  function rect(r){ if(!r) return {x:0,z:0,w:0,h:0}; if(r.w!=null) return {x:r.x||0,z:r.z||0,w:r.w,h:r.h??r.d??r.w}; if(r.width!=null) return {x:r.x||0,z:r.z||0,w:r.width,h:r.height??r.depth??r.width}; if(r.x1!=null) return {x:(r.x1+r.x2)/2,z:(r.z1+r.z2)/2,w:Math.abs(r.x2-r.x1),h:Math.abs(r.z2-r.z1)}; const s=r.size??20; return {x:r.x||0,z:r.z||0,w:s,h:s}; }

  function renderMap() {
    const objective = lastState.mission?.objective || lastState.hud?.objective || lastState.currentObjective || 'Explore Port Solenne.';
    content.innerHTML = `
      <div class="hh-map-layout">
        <div class="hh-map-wrap"><canvas class="hh-map-canvas" data-map></canvas></div>
        <div class="hh-map-side">
          <div class="hh-side-card">
            <div class="hh-side-title">Legend</div>
            <div class="hh-legend">
              <span class="hh-leg-mission">Mission Markers</span>
              <span class="hh-leg-player">You (Arrow)</span>
              <span class="hh-leg-safe">Safehouses</span>
              <span class="hh-leg-shop">Shops</span>
              <span class="hh-leg-beach">Beach / Coastline</span>
              <span class="hh-leg-ocean">Ocean (East)</span>
            </div>
          </div>
          <div class="hh-side-card" style="border-left-color:#ffcc4d;">
            <div class="hh-side-title" style="color:#ffcc4d;">Current Objective</div>
            <div style="font-size:14px;line-height:1.4;color:#f4f7fb;">${String(objective).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>
          </div>
          <div class="hh-side-card" style="border-left-color:#3ee6b0;">
            <div class="hh-side-title" style="color:#3ee6b0;">Districts</div>
            <div class="hh-muted" style="font-size:12px;line-height:1.5;">Marigold Beach<br>Old Pier<br>Glasswater Heights<br>Ferro Docks<br>Cinder Hills<br>Lagoon Bridge</div>
          </div>
        </div>
      </div>`;
    const wrap = content.querySelector('.hh-map-wrap');
    const canvas = content.querySelector('[data-map]');
    const ctx = canvas.getContext('2d');
    const rectW = wrap.clientWidth || 800;
    const rectH = wrap.clientHeight || 520;

    // Fit the city grid plus shoreline to the panel; the ocean itself extends to the panel edges.
    const land = [...(mapData.blocks||[]), ...(mapData.roads||[])];
    let minx=Infinity,maxx=-Infinity,minz=Infinity,maxz=-Infinity;
    for (const it of land){ const rc=rect(it); minx=Math.min(minx,rc.x-rc.w/2); maxx=Math.max(maxx,rc.x+rc.w/2); minz=Math.min(minz,rc.z-rc.h/2); maxz=Math.max(maxz,rc.z+rc.h/2); }
    if (!isFinite(minx)) { minx=-355; maxx=355; minz=-355; maxz=355; }
    const water0 = rect((mapData.water||[])[0]);
    const coastZ = (mapData.water||[]).length ? water0.z - water0.h/2 : maxz + WORLD.roadWidth * 2.5;
    const viewMinZ = minz - 25;
    const viewMaxZ = Math.max(coastZ, maxz) + 20;
    const worldH = maxx - minx;
    // Rotate: world +Z (beach/ocean) is canvas +X, world +X is canvas -Y.
    const sc = Math.min((rectW - 24) / Math.max(1, viewMaxZ - viewMinZ), (rectH - 20) / Math.max(1, worldH));
    const left = 12;
    const top = Math.max(10, (rectH - worldH * sc) / 2);
    canvas.width = Math.max(200, Math.floor(rectW));
    canvas.height = Math.max(200, Math.floor(rectH));
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    const w = canvas.width, h = canvas.height;
    const tx = (z)=> left + (z - viewMinZ) * sc;
    const ty = (x)=> top + (maxx - x) * sc;

    ctx.fillStyle = '#13202b'; ctx.fillRect(0,0,w,h);

    // Ocean fills everything seaward of the coastline, right out to the panel edges.
    const coastX = tx(coastZ);
    const oceanGrad = ctx.createLinearGradient(coastX, 0, w, 0);
    oceanGrad.addColorStop(0, '#3aa6bf');
    oceanGrad.addColorStop(0.4, '#2f88a8');
    oceanGrad.addColorStop(1, '#1d4f70');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(coastX, 0, Math.max(0, w - coastX), h);
    for (const it of (mapData.water||[]).slice(1)) {
      const r = rect(it);
      ctx.fillStyle = '#2f88a8';
      ctx.fillRect(tx(r.z - r.h/2), ty(r.x + r.w/2), r.h*sc, r.w*sc);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 1;
    for (let y = 12, k = 0; y < h; y += 24, k++) {
      ctx.beginPath();
      ctx.moveTo(coastX + 14 + (k % 2) * 16, y);
      ctx.lineTo(w - 8, y);
      ctx.stroke();
    }

    // Sand strip between the city edge and the shoreline.
    const beachX = tx(maxz);
    ctx.fillStyle = '#e8c98a';
    ctx.fillRect(beachX, 0, Math.max(0, coastX - beachX), h);
    ctx.strokeStyle = 'rgba(255,248,225,0.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(coastX, 0); ctx.lineTo(coastX, h); ctx.stroke();

    // Subtle district tints from the real layout district assignment.
    const cell = WORLD.blockSize + WORLD.roadWidth;
    const tints = {
      'Marigold Beach': 'rgba(232,201,138,0.22)',
      'Old Pier': 'rgba(92,200,255,0.16)',
      'Lagoon Bridge': 'rgba(140,180,255,0.14)',
      'Ferro Docks': 'rgba(62,230,176,0.14)',
      'Cinder Hills': 'rgba(255,150,90,0.13)',
      'Glasswater Heights': 'rgba(170,120,235,0.20)',
    };
    for (let j = 0; j < WORLD.grid; j++) {
      for (let i = 0; i < WORLD.grid; i++) {
        const name = DISTRICTS[districtFor(i, j)] || '';
        const bx = tx(minz + WORLD.roadWidth + j * cell);
        const by = ty(minx + WORLD.roadWidth + (i + 1) * cell);
        const bs = WORLD.blockSize * sc;
        ctx.fillStyle = tints[name] || 'rgba(255,255,255,0.05)';
        ctx.fillRect(bx, by, bs, bs);
      }
    }

    // Roads, then block outlines on top so the grid stays legible.
    ctx.fillStyle = '#4a5666';
    for (const it of (mapData.roads||[])) {
      const r = rect(it);
      ctx.fillRect(tx(r.z - r.h/2), ty(r.x + r.w/2), r.h*sc, r.w*sc);
    }
    ctx.strokeStyle = 'rgba(10,18,28,0.5)'; ctx.lineWidth = 1;
    for (const it of (mapData.blocks||[])) {
      const r = rect(it);
      ctx.strokeRect(tx(r.z - r.h/2), ty(r.x + r.w/2), r.h*sc, r.w*sc);
    }

    // Marker positions are needed up front so district labels can be offset away from them.
    const mm = lastState.mapMarkers || {};
    let missions = mm.missions;
    if (!Array.isArray(missions) || !missions.length) {
      missions = lastState.minimap?.target ? [{ ...lastState.minimap.target, num: 1 }] : [];
    }
    const missionPts = missions.filter(m => m && m.x != null && m.z != null).map((m, i) => ({ x: tx(m.z), y: ty(m.x), m, i }));

    // district labels computed from the real layout logic (layout.js)
    function districtCenters() {
      const acc={};
      for(let j=0;j<WORLD.grid;j++) for(let i=0;i<WORLD.grid;i++){
        const name=DISTRICTS[districtFor(i,j)] || districtFor(i,j);
        const x=minx+WORLD.roadWidth+i*cell+WORLD.blockSize/2;
        const z=minz+WORLD.roadWidth+j*cell+WORLD.blockSize/2;
        const a=(acc[name]||(acc[name]={x:0,z:0,c:0})); a.x+=x; a.z+=z; a.c++;
      }
      return Object.entries(acc).map(([name,v])=>({name,x:v.x/v.c,z:v.z/v.c}));
    }
    const districts = (Array.isArray(lastState.districts) && lastState.districts.length) ? lastState.districts : districtCenters();
    ctx.font = '800 12px "Segoe UI", Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const d of districts) {
      if (d.x == null || d.z == null) continue;
      const label = String(d.name||'').toUpperCase();
      const tw = ctx.measureText(label).width;
      const bx = tx(d.z), by = ty(d.x);
      let best = null;
      for (const [dx, dy] of [[0,-17],[0,17],[-22,-17],[22,-17],[-22,17],[22,17],[0,-36],[0,36]]) {
        const cx = bx + dx, cy = by + dy;
        let hits = 0;
        for (const p of missionPts) {
          const nx = Math.max(cx - tw/2 - 6, Math.min(p.x, cx + tw/2 + 6));
          const ny = Math.max(cy - 9, Math.min(p.y, cy + 9));
          if ((p.x-nx)*(p.x-nx) + (p.y-ny)*(p.y-ny) < 196) hits++;
        }
        if (!best || hits < best.hits) best = { cx, cy, hits };
        if (!hits) break;
      }
      ctx.fillStyle = 'rgba(5,9,16,0.85)';
      ctx.fillRect(best.cx - tw/2 - 5, best.cy - 9, tw + 10, 18);
      ctx.strokeStyle = 'rgba(92,200,255,0.28)'; ctx.lineWidth = 1;
      ctx.strokeRect(best.cx - tw/2 - 5, best.cy - 9, tw + 10, 18);
      ctx.fillStyle = '#e8eef7';
      ctx.fillText(label, best.cx, best.cy);
    }

    for (const { x: mx, y: my, m, i } of missionPts) {
      ctx.fillStyle = '#ffcc4d'; ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#111'; ctx.font = '900 11px "Segoe UI", Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(String(m.num ?? m.number ?? (i+1)), mx, my+0.5);
    }

    const safe = mm.safehouses || [];
    for (const s of safe) {
      if (s.x == null || s.z == null) continue;
      ctx.fillStyle = '#3ee6b0'; ctx.fillRect(tx(s.z)-6, ty(s.x)-6, 12, 12);
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(tx(s.z)-6, ty(s.x)-6, 12, 12);
    }
    const shops = mm.shops || lastState.minimap?.shops || [];
    ctx.font='900 12px "Segoe UI", Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    for (const s of shops) {
      if (s.x == null || s.z == null) continue;
      ctx.fillStyle='#5cc8ff'; ctx.beginPath(); ctx.arc(tx(s.z), ty(s.x), 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#081018'; ctx.fillText(String(s.letter||s.label||'S'), tx(s.z), ty(s.x)+0.5);
    }

    // player arrow
    if (lastState.player) {
      const px = tx(lastState.player.z || 0), py = ty(lastState.player.x || 0);
      const yaw = lastState.player.yaw ?? 0;
      // world forward (sin yaw, cos yaw) mapped: screen dx = cos yaw (z), screen dy = -sin yaw (since ty inverts x)
      const ang = Math.atan2(-Math.sin(yaw), Math.cos(yaw));
      ctx.save(); ctx.translate(px, py); ctx.rotate(ang - Math.PI/2);
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(7, 8); ctx.lineTo(0, 4); ctx.lineTo(-7, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  function renderMissions() {
    const groups = lastState.missionGroups || [
      { act:'Act I', missions:[{name:'Welcome to the Heat',status:'done'},{name:'Neon Tides',status:'active'},{name:'Dockside Deal',status:'locked'}] },
      { act:'Act II', missions:[{name:'Skyline Run',status:'locked'},{name:'Salt and Steel',status:'locked'}] },
    ];
    let html = '<div class="hh-list">';
    for (const g of groups) {
      html += `<div class="hh-act">${g.act||''}</div>`;
      for (const m of (g.missions||[])) {
        const st = m.status||'locked';
        const label = st==='done'?'Completed':st==='active'?'Active':'Locked';
        html += `<div class="hh-mission-row"><span>${m.name||m.title||'Mission'}</span><span class="hh-status-${st}">${label}</span></div>`;
      }
    }
    html += '</div>';
    content.innerHTML = html;
  }

  function renderStats() {
    const s = lastState.stats || {};
    const items = [
      ['Money', fmtMoney(lastState.player?.money ?? s.money ?? 0)],
      ['Respect Rank', lastState.rank?.name ?? s.rank ?? 'Street Rat'],
      ['Respect XP', Math.floor(lastState.rank?.xp ?? s.xp ?? 0)],
      ['Missions Done', (lastState.completedMissions?.length ?? s.missionsDone ?? 0)],
      ['Play Time', fmtTime(lastState.playTime ?? s.playTime ?? 0)],
      ['Cars Owned', (lastState.ownedCars?.length ?? s.carsOwned ?? 0)],
    ];
    content.innerHTML = `<div class="hh-stats-grid">${items.map(([k,v])=>`<div class="hh-stat"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div>`;
  }

  function renderSettingsTab() {
    const settings = loadSettings();
    const row = (label, inner) => `<div class="hh-settings-row"><label>${label}</label><div>${inner}</div></div>`;
    content.innerHTML = `<div>
      ${row('Master Volume', `<input type="range" min="0" max="1" step="0.05" data-set="volume.master" value="${settings.volume.master}">`)}
      ${row('Music Volume', `<input type="range" min="0" max="1" step="0.05" data-set="volume.music" value="${settings.volume.music}">`)}
      ${row('SFX Volume', `<input type="range" min="0" max="1" step="0.05" data-set="volume.sfx" value="${settings.volume.sfx}">`)}
      ${row('Engine Volume', `<input type="range" min="0" max="1" step="0.05" data-set="volume.engine" value="${settings.volume.engine}">`)}
      ${row('Mouse Sensitivity', `<input type="range" min="0.2" max="2" step="0.1" data-set="mouseSensitivity" value="${settings.mouseSensitivity}">`)}
      ${row('Invert Y', `<input type="checkbox" data-set="invertY" ${settings.invertY?'checked':''}>`)}
      ${row('Draw Distance', `<select data-set="drawDistance"><option value="0.5" ${settings.drawDistance<=0.6?'selected':''}>Low</option><option value="1" ${settings.drawDistance>0.6&&settings.drawDistance<=1.2?'selected':''}>Medium</option><option value="1.5" ${settings.drawDistance>1.2?'selected':''}>High</option></select>`)}
      ${row('Shadows', `<input type="checkbox" data-set="shadows" ${settings.shadows?'checked':''}>`)}
    </div>`;
    content.querySelectorAll('[data-set]').forEach(inp => {
      inp.addEventListener('change', () => {
        const path = inp.getAttribute('data-set');
        let val;
        if (inp.type === 'checkbox') val = inp.checked;
        else if (inp.tagName === 'SELECT' || inp.step) val = Number(inp.value);
        else val = inp.value;
        const cur = loadSettings();
        if (path.startsWith('volume.')) cur.volume[path.split('.')[1]] = val; else cur[path] = val;
        const saved = saveSettings(cur);
        callbacks.onSettingsChange && callbacks.onSettingsChange(saved);
      });
    });
  }

  function renderSave() {
    const slots = typeof callbacks.getSlots === 'function' ? callbacks.getSlots() : listSlots();
    content.innerHTML = `<div class="hh-save-slots"></div><div class="hh-muted" style="margin-top:10px;font-size:12px;">Select a slot to save your current progress.</div>`;
    const wrap = content.querySelector('.hh-save-slots');
    for (const entry of slots) {
      const card = document.createElement('div');
      card.className = 'hh-save-card';
      card.innerHTML = `<div class="hh-save-detail">${slotDetails(entry)}</div>`;
      card.addEventListener('click', () => { callbacks.onSaveSlot && callbacks.onSaveSlot(entry.slot); renderSave(); });
      wrap.appendChild(card);
    }
  }

  function render() {
    content.classList.toggle('scroll', active !== 'map');
    if (active === 'map') renderMap();
    else if (active === 'missions') renderMissions();
    else if (active === 'stats') renderStats();
    else if (active === 'settings') renderSettingsTab();
    else if (active === 'save') renderSave();
  }

  function setMapData(data) { if (data) mapData = { roads: data.roads||[], blocks: data.blocks||[], water: data.water||[] }; if (active==='map' && isShown) renderMap(); }
  function show(data) { if (data) { if (data.mapData) setMapData(data.mapData); lastState = { ...lastState, ...data }; } root.classList.remove('hh-hidden'); isShown = true; render(); }
  function hide() { if (!isShown) { root.classList.add('hh-hidden'); return; } isShown = false; root.classList.add('hh-hidden'); callbacks.onClose && callbacks.onClose(); }
  function update(state) { if (state) lastState = { ...lastState, ...state }; if (isShown && (active==='map'||active==='stats'||active==='missions')) render(); }
  return { show, hide, update, setMapData, el: root };
}
