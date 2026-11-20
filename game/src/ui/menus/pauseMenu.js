// Pause menu: MAP, MISSIONS, STATS, SETTINGS, SAVE tabs.
import { injectMenuStyles } from './menuStyles.js';
import { listSlots, slotSummary } from '../../save/saveSlots.js';
import { loadSettings, saveSettings } from '../../save/settings.js';

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

    // world bounds from map data (roads/blocks/water)
    const items = [...(mapData.water||[]), ...(mapData.blocks||[]), ...(mapData.roads||[])];
    let minx=Infinity,maxx=-Infinity,minz=Infinity,maxz=-Infinity;
    for (const it of items){ const rc=rect(it); minx=Math.min(minx,rc.x-rc.w/2); maxx=Math.max(maxx,rc.x+rc.w/2); minz=Math.min(minz,rc.z-rc.h/2); maxz=Math.max(maxz,rc.z+rc.h/2); }
    if (!isFinite(minx)) { minx=-355; maxx=355; minz=-355; maxz=650; }
    // Rotate map so world +Z (south/beach/ocean) appears on east (right) side: map world Z -> canvas X, world X -> canvas Y
    const worldW = maxz - minz;
    const worldH = maxx - minx;
    const pad = 28;
    const sc = Math.min((rectW - pad*2) / Math.max(1, worldW), (rectH - pad*2) / Math.max(1, worldH));
    const drawW = worldW * sc + pad*2;
    const drawH = worldH * sc + pad*2;
    canvas.width = Math.max(200, Math.floor(drawW));
    canvas.height = Math.max(200, Math.floor(drawH));
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    const w = canvas.width, h = canvas.height;
    const tx = (z)=> pad + (z - minz) * sc; // world z -> canvas x (east)
    const ty = (x)=> pad + (maxx - x) * sc; // world x -> canvas y (north up-ish)

    ctx.fillStyle = '#13202b'; ctx.fillRect(0,0,w,h);

    // ocean on east side
    for (const it of (mapData.water||[])) {
      const r = rect(it);
      ctx.fillStyle = '#2f88a8';
      ctx.fillRect(tx(r.z - r.h/2), ty(r.x + r.w/2), r.h*sc, r.w*sc);
    }
    // beach band near coastline (east side of land, high world z)
    ctx.fillStyle = '#e8c98a';
    for (const it of (mapData.blocks||[])) {
      const r = rect(it);
      if (r.z > maxz - 420) { // southern/beach-side blocks
        ctx.fillRect(tx(r.z - r.h/2), ty(r.x + r.w/2), r.h*sc, r.w*sc);
      }
    }
    // coastline stroke
    ctx.strokeStyle = 'rgba(255,245,220,0.7)'; ctx.lineWidth = 2;
    const coastZ = (mapData.water && mapData.water[0]) ? (rect(mapData.water[0]).z - rect(mapData.water[0]).h/2) : (maxz - 260);
    ctx.beginPath(); ctx.moveTo(tx(coastZ), pad); ctx.lineTo(tx(coastZ), h-pad); ctx.stroke();

    // roads
    ctx.fillStyle = '#4a5666';
    for (const it of (mapData.roads||[])) {
      const r = rect(it);
      ctx.fillRect(tx(r.z - r.h/2), ty(r.x + r.w/2), r.h*sc, r.w*sc);
    }
    // blocks overlay (non-beach tint/detail)
    ctx.strokeStyle = 'rgba(70,90,110,0.55)'; ctx.lineWidth = 1;
    for (const it of (mapData.blocks||[])) {
      const r = rect(it);
      const bx = tx(r.z - r.h/2), by = ty(r.x + r.w/2), bw = r.h*sc, bh = r.w*sc;
      if (r.z <= maxz - 420) { ctx.fillStyle = 'rgba(38,52,69,0.55)'; ctx.fillRect(bx,by,bw,bh); }
      ctx.strokeRect(bx,by,bw,bh);
    }

    // district labels computed from real layout logic (layout.js/mapData.js)
    function districtCenters() {
      const n=12, blockSize=44, roadWidth=14, cell=58, offsetX=-355, offsetZ=-355;
      function districtFor(i,j){
        if (j >= n - 2) return 'Marigold Beach';
        if (j >= n - 3 && i <= 2) return 'Old Pier';
        if (i >= 4 && i <= 7 && j >= n - 4 && j <= n - 3) return 'Lagoon Bridge';
        if (i <= 2 && j >= n - 4) return 'Old Pier';
        if (i >= 8 && j <= 4) return 'Cinder Hills';
        if (i >= 7 && j >= 5 && j <= 8) return 'Glasswater Heights';
        if (i <= 3 && j <= 4) return 'Ferro Docks';
        if (j <= 2) return 'Ferro Docks';
        if (i >= 5) return 'Glasswater Heights';
        return 'Cinder Hills';
      }
      const acc={};
      for(let j=0;j<n;j++) for(let i=0;i<n;i++){
        const name=districtFor(i,j); const x=offsetX+roadWidth+i*cell+blockSize/2; const z=offsetZ+roadWidth+j*cell+blockSize/2;
        const a=(acc[name]||(acc[name]={x:0,z:0,c:0})); a.x+=x; a.z+=z; a.c++;
      }
      return Object.entries(acc).map(([name,v])=>({name,x:v.x/v.c,z:v.z/v.c}));
    }
    const districts = (Array.isArray(lastState.districts) && lastState.districts.length) ? lastState.districts : districtCenters();
    ctx.font = '800 13px "Segoe UI", Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const d of districts) {
      if (d.x == null || d.z == null) continue;
      ctx.fillStyle = 'rgba(8,12,18,0.55)';
      const label = String(d.name||'').toUpperCase();
      const tw = ctx.measureText(label).width;
      ctx.fillRect(tx(d.z)-tw/2-4, ty(d.x)-9, tw+8, 18);
      ctx.fillStyle = '#e8eef7';
      ctx.fillText(label, tx(d.z), ty(d.x));
    }

    // markers
    const mm = lastState.mapMarkers || {};
    let missions = mm.missions;
    if (!Array.isArray(missions) || !missions.length) {
      missions = lastState.minimap?.target ? [{ ...lastState.minimap.target, num: 1 }] : [];
    }
    missions.forEach((m, i) => {
      if (m.x == null || m.z == null) return;
      const mx = tx(m.z), my = ty(m.x);
      ctx.fillStyle = '#ffcc4d'; ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#111'; ctx.font = '900 11px "Segoe UI", Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(String(m.num ?? m.number ?? (i+1)), mx, my+0.5);
    });

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
      const s = slotSummary(entry.data);
      const card = document.createElement('div');
      card.className = 'hh-slot';
      card.innerHTML = s ? `<div class="hh-slot-title">Slot ${entry.slot}</div><div class="hh-slot-meta">${s.missionPercent}% · ${fmtMoney(s.money)} · ${fmtTime(s.playTime)}</div>` : `<div class="hh-slot-title">Slot ${entry.slot}</div><div class="hh-muted">Empty Slot</div>`;
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
