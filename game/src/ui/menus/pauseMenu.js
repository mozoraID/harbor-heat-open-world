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
    content.innerHTML = `<canvas class="hh-map-canvas" data-map width="1200" height="520"></canvas>
      <div class="hh-legend"><span class="hh-leg-mission">Mission Markers</span><span class="hh-leg-safe">Safehouses</span><span class="hh-leg-shop">Shops</span><span class="hh-leg-district">Districts / Roads</span></div>`;
    const canvas = content.querySelector('[data-map]');
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#14202b'; ctx.fillRect(0,0,w,h);
    const items = [...(mapData.water||[]), ...(mapData.blocks||[]), ...(mapData.roads||[])];
    let minx=Infinity,maxx=-Infinity,minz=Infinity,maxz=-Infinity;
    for (const it of items){ const rc=rect(it); minx=Math.min(minx,rc.x-rc.w/2); maxx=Math.max(maxx,rc.x+rc.w/2); minz=Math.min(minz,rc.z-rc.h/2); maxz=Math.max(maxz,rc.z+rc.h/2); }
    if (!isFinite(minx)) { minx=-400; maxx=400; minz=-400; maxz=400; }
    const pad=40; const sx=(w-pad*2)/Math.max(1,maxx-minx); const sz=(h-pad*2)/Math.max(1,maxz-minz); const sc=Math.min(sx,sz);
    const tx = (x)=> pad + (x-minx)*sc; const tz=(z)=> pad + (z-minz)*sc;
    ctx.fillStyle='#1f4f7a'; for(const it of (mapData.water||[])){ const r=rect(it); ctx.fillRect(tx(r.x-r.w/2), tz(r.z-r.h/2), r.w*sc, r.h*sc); }
    ctx.fillStyle='#263445'; ctx.strokeStyle='#33465a'; for(const it of (mapData.blocks||[])){ const r=rect(it); ctx.fillRect(tx(r.x-r.w/2), tz(r.z-r.h/2), r.w*sc, r.h*sc); ctx.strokeRect(tx(r.x-r.w/2), tz(r.z-r.h/2), r.w*sc, r.h*sc); }
    ctx.fillStyle='#4a5666'; for(const it of (mapData.roads||[])){ const r=rect(it); ctx.fillRect(tx(r.x-r.w/2), tz(r.z-r.h/2), r.w*sc, r.h*sc); }
    // districts labels
    const districts = lastState.districts || [
      {name:'Marigold Beach',x:0,z:0},{name:'Coral Quay',x:150,z:-120},{name:'Salt Docks',x:-160,z:120},{name:'Old Span',x:120,z:140},{name:'Verdant Hills',x:-140,z:-140}
    ];
    ctx.fillStyle='#c9d3df'; ctx.font='700 14px "Segoe UI", Arial'; ctx.textAlign='center';
    for(const d of districts){ if(d.x==null) continue; ctx.fillText(String(d.name||'').toUpperCase(), tx(d.x), tz(d.z)); }
    // markers
    const mm = lastState.mapMarkers || {};
    const missions = mm.missions || (lastState.minimap?.target ? [lastState.minimap.target] : [{x:140,z:-120}]);
    ctx.fillStyle='#ffcc4d'; for(const m of missions){ if(m.x==null) continue; ctx.beginPath(); ctx.arc(tx(m.x), tz(m.z),6,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#111'; ctx.fillRect(tx(m.x)-2,tz(m.z)-10,4,6); ctx.fillStyle='#ffcc4d'; }
    const safe = mm.safehouses || [{x:-80,z:60,name:'Safehouse'}];
    ctx.fillStyle='#3ee6b0'; for(const s of safe){ if(s.x==null) continue; ctx.fillRect(tx(s.x)-5,tz(s.z)-5,10,10); }
    const shops = mm.shops || lastState.minimap?.shops || [{x:90,z:80,letter:'G'},{x:-60,z:40,letter:'A'}];
    ctx.fillStyle='#5cc8ff'; ctx.font='900 13px "Segoe UI", Arial'; for(const s of shops){ if(s.x==null) continue; ctx.beginPath(); ctx.arc(tx(s.x),tz(s.z),7,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#081018'; ctx.fillText(String(s.letter||'S'), tx(s.x), tz(s.z)+4); ctx.fillStyle='#5cc8ff'; }
    // player
    if (lastState.player){ ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(tx(lastState.player.x||0), tz(lastState.player.z||0),5,0,Math.PI*2); ctx.fill(); }
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
