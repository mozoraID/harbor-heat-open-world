// Weapon bar: compact row of slots 1-6 (active large) with canvas icons and ammo.
import { el } from './utils.js';

const DEFAULT_WEAPONS = [
  { slot: 1, id: 'fists', name: 'Fists', ammo: null, owned: true },
  { slot: 2, id: 'bat', name: 'Bat', ammo: null, owned: true },
  { slot: 3, id: 'pistol', name: 'Kestrel 9', ammo: [12, 60], owned: true },
  { slot: 4, id: 'smg', name: 'Viper', ammo: [30, 120], owned: true },
  { slot: 5, id: 'shotgun', name: 'Breaker', ammo: [8, 32], owned: false },
  { slot: 6, id: 'rifle', name: 'Tern AR', ammo: [30, 90], owned: false },
];

function drawIcon(canvas, id, active) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.save();
  if (active) ctx.translate(2, 2);
  const s = active ? 1.1 : 0.85;
  ctx.scale(s, s);
  ctx.strokeStyle = '#e8eef7';
  ctx.fillStyle = '#e8eef7';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (id === 'fists') {
    ctx.beginPath(); ctx.arc(14,10,5,0,Math.PI*2); ctx.stroke();
    ctx.strokeRect(7,15,14,7);
  } else if (id === 'bat') {
    ctx.beginPath(); ctx.moveTo(4,22); ctx.lineTo(24,4); ctx.lineWidth=4; ctx.stroke();
  } else if (id === 'pistol') {
    ctx.fillRect(4,8,16,5); ctx.fillRect(7,13,5,8);
  } else if (id === 'smg') {
    ctx.fillRect(2,9,20,4); ctx.fillRect(9,13,4,7); ctx.fillRect(16,6,3,3);
  } else if (id === 'shotgun') {
    ctx.fillRect(1,9,24,4); ctx.fillRect(6,13,4,7); ctx.strokeRect(18,7,5,4);
  } else if (id === 'rifle') {
    ctx.fillRect(1,10,24,3); ctx.fillRect(8,13,5,7); ctx.fillRect(14,7,2,3); ctx.fillRect(20,8,3,3);
  } else {
    ctx.strokeRect(6,6,14,14);
  }
  ctx.restore();
}

export function createWeaponBar(root) {
  const wrap = el('div', 'hh-weaponbar');
  root.appendChild(wrap);
  const slots = [];
  for (let i = 1; i <= 6; i++) {
    const slot = el('div', 'hh-slot');
    slot.innerHTML = `<span class="hh-slot-num">${i}</span><canvas width="30" height="26"></canvas><span class="hh-slot-name"></span><span class="hh-slot-ammo"></span>`;
    wrap.appendChild(slot);
    slots.push({
      el: slot,
      canvas: slot.querySelector('canvas'),
      name: slot.querySelector('.hh-slot-name'),
      ammo: slot.querySelector('.hh-slot-ammo'),
      drawn: null,
      drawnActive: null,
    });
  }

  function update(state) {
    const weapons = Array.isArray(state.weapons) && state.weapons.length ? state.weapons : DEFAULT_WEAPONS;
    const active = state.player?.activeWeapon ?? state.activeWeapon ?? 1;
    for (let i = 0; i < 6; i++) {
      const w = weapons.find(x => x.slot === i + 1) || weapons[i] || DEFAULT_WEAPONS[i];
      const s = slots[i];
      const isActive = active === (i + 1);
      const owned = w.owned !== false && !w.locked;
      s.el.classList.toggle('active', isActive);
      s.el.classList.toggle('locked', !owned);
      s.name.textContent = w.name || '';
      if (Array.isArray(w.ammo)) s.ammo.textContent = w.ammo[0] + '/' + w.ammo[1];
      else if (w.ammo != null) s.ammo.textContent = String(w.ammo);
      else s.ammo.textContent = '';
      const id = w.id || 'fists';
      if (s.drawn !== id || s.drawnActive !== isActive) {
        drawIcon(s.canvas, id, isActive);
        s.drawn = id; s.drawnActive = isActive;
      }
    }
  }
  return { update, el: wrap };
}
