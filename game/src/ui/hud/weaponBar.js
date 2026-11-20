// Weapon bar: slots 1-6 with canvas icons, ammo, locked/active states.
import { el } from './utils.js';

const DEFAULT_WEAPONS = [
  { slot: 1, id: 'fists', name: 'Fists', ammo: null, owned: true },
  { slot: 2, id: 'bat', name: 'Bat', ammo: null, owned: true },
  { slot: 3, id: 'pistol', name: 'Kestrel 9', ammo: [12, 60], owned: true },
  { slot: 4, id: 'smg', name: 'Viper', ammo: [30, 120], owned: true },
  { slot: 5, id: 'shotgun', name: 'Breaker', ammo: [8, 32], owned: false },
  { slot: 6, id: 'rifle', name: 'Tern AR', ammo: [30, 90], owned: false },
];

function drawIcon(canvas, id) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle = '#e8eef7';
  ctx.fillStyle = '#e8eef7';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (id === 'fists') {
    ctx.arc(18,14,6,0,Math.PI*2); ctx.stroke();
    ctx.strokeRect(10,20,16,8);
  } else if (id === 'bat') {
    ctx.moveTo(6,26); ctx.lineTo(30,6); ctx.lineWidth=4; ctx.stroke();
  } else if (id === 'pistol') {
    ctx.fillRect(6,10,20,6); ctx.fillRect(10,16,6,10);
  } else if (id === 'smg') {
    ctx.fillRect(4,12,24,5); ctx.fillRect(12,17,5,8); ctx.fillRect(20,8,4,4);
  } else if (id === 'shotgun') {
    ctx.fillRect(2,12,30,5); ctx.fillRect(8,17,5,8); ctx.strokeRect(24,10,6,4);
  } else if (id === 'rifle') {
    ctx.fillRect(2,13,30,4); ctx.fillRect(10,17,6,8); ctx.fillRect(18,9,3,4); ctx.fillRect(26,11,4,3);
  } else {
    ctx.strokeRect(8,8,16,16);
  }
}

export function createWeaponBar(root) {
  const wrap = el('div', 'hh-weaponbar');
  root.appendChild(wrap);
  const slots = [];
  for (let i = 1; i <= 6; i++) {
    const slot = el('div', 'hh-slot');
    slot.innerHTML = `<span class="hh-slot-num">${i}</span><canvas width="32" height="32"></canvas><span class="hh-slot-name"></span><span class="hh-slot-ammo"></span>`;
    wrap.appendChild(slot);
    slots.push({
      el: slot,
      canvas: slot.querySelector('canvas'),
      name: slot.querySelector('.hh-slot-name'),
      ammo: slot.querySelector('.hh-slot-ammo'),
      drawn: null,
    });
  }

  function update(state) {
    const weapons = Array.isArray(state.weapons) && state.weapons.length ? state.weapons : DEFAULT_WEAPONS;
    const active = state.player?.activeWeapon ?? state.activeWeapon ?? 1;
    for (let i = 0; i < 6; i++) {
      const w = weapons.find(x => x.slot === i + 1) || weapons[i] || DEFAULT_WEAPONS[i];
      const s = slots[i];
      const owned = w.owned !== false && !w.locked;
      s.el.classList.toggle('active', active === (i + 1));
      s.el.classList.toggle('locked', !owned);
      s.name.textContent = w.name || '';
      if (Array.isArray(w.ammo)) s.ammo.textContent = w.ammo[0] + '/' + w.ammo[1];
      else if (w.ammo != null) s.ammo.textContent = String(w.ammo);
      else s.ammo.textContent = '';
      const id = w.id || 'fists';
      if (s.drawn !== id) { drawIcon(s.canvas, id); s.drawn = id; }
    }
  }
  return { update, el: wrap };
}
