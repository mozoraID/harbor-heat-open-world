// Speedometer: speed, car name, condition bar with percent, gear.
import { el, clamp } from './utils.js';

export function createSpeedometer(root) {
  const wrap = el('div', 'hh-panel hh-speedo hh-accent-coral');
  wrap.innerHTML = `
    <div><span class="hh-speed-num" data-speed>0</span><span class="hh-speed-unit">KM/H</span></div>
    <div class="hh-speed-car" data-car>On Foot</div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
      <div class="hh-bar-bg" style="flex:1;height:10px"><div class="hh-bar-fill" data-cond style="width:100%;background:linear-gradient(90deg,#3ee6b0,#ffcc4d)"></div></div>
      <div class="hh-caption" data-cond-text style="min-width:38px;text-align:right">100%</div>
    </div>
    <div class="hh-caption" data-gear style="margin-top:4px;color:#ffcc4d">GEAR N</div>
  `;
  root.appendChild(wrap);
  const speedEl = wrap.querySelector('[data-speed]');
  const carEl = wrap.querySelector('[data-car]');
  const cond = wrap.querySelector('[data-cond]');
  const condText = wrap.querySelector('[data-cond-text]');
  const gearEl = wrap.querySelector('[data-gear]');

  function update(state) {
    const inCar = !!state.player?.inCar;
    const car = state.car || {};
    const speed = inCar ? Math.abs(Number(car.speed ?? state.speed ?? 0)) * 3.6 : 0;
    speedEl.textContent = Math.round(speed);
    carEl.textContent = inCar ? (car.name || 'Vehicle') : 'On Foot';
    const c = clamp(Number(car.condition ?? (inCar ? 100 : 0)), 0, 100);
    cond.style.width = c + '%';
    condText.textContent = Math.round(c) + '%';
    cond.style.background = c > 50 ? 'linear-gradient(90deg,#3ee6b0,#ffcc4d)' : 'linear-gradient(90deg,#ff6b5a,#ffcc4d)';
    const gear = inCar ? (car.gear ?? 'D') : 'N';
    gearEl.textContent = 'GEAR ' + String(gear).toUpperCase();
    wrap.style.opacity = inCar ? '1' : '0.8';
  }
  return { update, el: wrap };
}
