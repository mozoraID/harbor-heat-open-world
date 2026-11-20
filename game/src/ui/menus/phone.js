// In-game phone: wallpaper, apps (Contacts, Jobs, Map, Garage, Radio, Messages).
import { injectMenuStyles } from './menuStyles.js';

const DEFAULT_CONTACTS = [
  { id:'mama', name:'Mama Inés', role:'Fixer Matriarch' },
  { id:'wrench', name:'Wrench', full:'Teo "Wrench" Okafor', role:'Mechanic' },
  { id:'sasha', name:'Sasha Lune', role:'Getaway Artist' },
];
const DEFAULT_MESSAGES = [
  { from:'Mama Inés', text:'Mijo, Port Solenne takes what it wants. Bring me that courier bag and we talk real work.' },
  { from:'Wrench', text:'Got a new intake for the Vortex. Swing by the shop, I\'ll make it scream.' },
  { from:'Sasha Lune', text:'Heat\'s heavy tonight. If you run, run clean—I\'ll watch the north bridge.' },
  { me:true, text:'On my way. Keep the engine warm.' },
];

export function createPhone(rootEl, callbacks = {}) {
  injectMenuStyles();
  const root = document.createElement('div');
  root.className = 'hh-menu-root hh-hidden';
  root.style.pointerEvents = 'auto';
  root.innerHTML = `
    <div class="hh-phone-wrap">
      <div class="hh-phone">
        <div class="hh-phone-notch"></div>
        <div class="hh-phone-screen">
          <div class="hh-phone-home" data-home></div>
          <div class="hh-phone-appview hh-hidden" data-appview>
            <div class="hh-phone-appbar"><span class="hh-back" data-back>‹ Back</span><span data-appname></span></div>
            <div class="hh-phone-body" data-body></div>
          </div>
        </div>
      </div>
    </div>
  `;
  rootEl.appendChild(root);
  const home = root.querySelector('[data-home]');
  const appView = root.querySelector('[data-appview]');
  const appName = root.querySelector('[data-appname]');
  const body = root.querySelector('[data-body]');
  let current = null;
  let lastState = {};

  const apps = [
    { id:'contacts', label:'Contacts', icon:'👥' },
    { id:'jobs', label:'Jobs', icon:'📋' },
    { id:'map', label:'Map', icon:'🗺️' },
    { id:'garage', label:'Garage', icon:'🚗' },
    { id:'radio', label:'Radio', icon:'📻' },
    { id:'messages', label:'Messages', icon:'💬' },
  ];

  function renderHome() {
    home.innerHTML = apps.map(a => `<div class="hh-app" data-app="${a.id}"><div class="hh-app-icon">${a.icon}</div><div>${a.label}</div></div>`).join('');
  }

  function openApp(id) {
    current = id;
    const app = apps.find(a=>a.id===id);
    appName.textContent = app ? app.label : id;
    home.classList.add('hh-hidden');
    appView.classList.remove('hh-hidden');
    renderApp(id);
    callbacks.onAppOpen && callbacks.onAppOpen(id);
  }
  function closeApp() { current = null; appView.classList.add('hh-hidden'); home.classList.remove('hh-hidden'); }

  function renderApp(id) {
    if (id === 'contacts') {
      const contacts = lastState.contacts || DEFAULT_CONTACTS;
      body.innerHTML = contacts.map(c => `<div class="hh-contact" data-call="${c.id}"><div><div style="font-weight:900">${c.name||c.full}</div><div class="hh-muted" style="font-size:11px">${c.role||''}</div></div><div class="hh-call-btn">CALL</div></div>`).join('');
      body.querySelectorAll('[data-call]').forEach(el => el.addEventListener('click', () => callbacks.onCall && callbacks.onCall(el.getAttribute('data-call'))));
    } else if (id === 'jobs') {
      const jobs = lastState.jobs || [{title:'Courier Dash',desc:'Deliver packages across Coral Quay',reward:'S$ 800'},{title:'Repo Run',desc:'Recover a marked car from Salt Docks',reward:'S$ 1,200'}];
      body.innerHTML = jobs.map(j => `<div class="hh-job"><div style="font-weight:900">${j.title||j.name}</div><div class="hh-muted" style="font-size:12px;margin-top:2px">${j.desc||j.description||''}</div><div style="color:#3ee6b0;font-size:12px;margin-top:4px">${j.reward||''}</div></div>`).join('') || '<div class="hh-muted">No side activities available.</div>';
    } else if (id === 'map') {
      body.innerHTML = `<div class="hh-muted" style="font-size:13px;line-height:1.5;">Current District: <b style="color:#fff">${lastState.districtName||'Marigold Beach'}</b><br><br>Open Pause (Esc) for the full city map with markers and legend.</div>`;
    } else if (id === 'garage') {
      const cars = lastState.ownedCars || [{name:'Solenne Vortex GT',status:'Stored'},{name:'Bayline Cruiser',status:'Out'}];
      body.innerHTML = cars.length ? cars.map(c => `<div class="hh-garage-item"><div style="font-weight:900">${c.name||c}</div><div class="hh-muted" style="font-size:12px">${c.status||'Owned'}</div></div>`).join('') : '<div class="hh-muted">No cars in garage.</div>';
    } else if (id === 'radio') {
      const stations = lastState.radioStations || ['WAVE 101.7 Coastline Pop','KRUSH 94.2 Synth Nights','SALT FM Dock Funk'];
      const cur = lastState.radio?.station || stations[0];
      body.innerHTML = `<div class="hh-muted" style="margin-bottom:8px;font-size:12px;">Press R in-game to switch station.</div>` + stations.map(s=>`<div class="hh-thread-item" style="border-left:3px solid ${s===cur||s.startsWith(cur)?'#3ee6b0':'#555'}">${s}</div>`).join('');
      callbacks.onRadioOpen && callbacks.onRadioOpen();
    } else if (id === 'messages') {
      const msgs = lastState.messages || DEFAULT_MESSAGES;
      body.innerHTML = msgs.map(m => `<div class="hh-msg ${m.me?'me':''}"><div class="from">${m.me?'You':(m.from||'Unknown')}</div><div class="bubble">${m.text||''}</div></div>`).join('');
    }
  }

  home.addEventListener('click', (e)=>{ const a=e.target.closest('[data-app]'); if(a) openApp(a.getAttribute('data-app')); });
  root.querySelector('[data-back]').addEventListener('click', closeApp);
  root.addEventListener('click', (e)=>{ if (e.target === root) { callbacks.onClose && callbacks.onClose(); hide(); } });

  function show(data){ if(data) lastState={...lastState,...data}; renderHome(); if(!current) closeApp(); else renderApp(current); root.classList.remove('hh-hidden'); callbacks.onOpen && callbacks.onOpen(); }
  function hide(){ root.classList.add('hh-hidden'); callbacks.onClose && callbacks.onClose(); }
  function update(state){ if(state) lastState={...lastState,...state}; if(!root.classList.contains('hh-hidden') && current) renderApp(current); }
  return { show, hide, update, el: root };
}
