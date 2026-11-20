// Speedometer: semicircular gauge with needle+redline, speed, gear, car name, damage icon and condition bar.
import { el, clamp } from './utils.js';

function drawDamageIcon(canvas, cond) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const color = cond > 60 ? '#3ee6b0' : cond > 30 ? '#ffcc4d' : '#ff6b5a';
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  // car silhouette
  ctx.beginPath();
  ctx.moveTo(2, 14); ctx.lineTo(5, 9); ctx.lineTo(12, 7); ctx.lineTo(22, 7); ctx.lineTo(29, 9); ctx.lineTo(32, 14);
  ctx.lineTo(32, 17); ctx.lineTo(2, 17); ctx.closePath();
  ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
  // wheels
  ctx.beginPath(); ctx.arc(9, 17, 3, 0, Math.PI, true); ctx.stroke();
  ctx.beginPath(); ctx.arc(25, 17, 3, 0, Math.PI, true); ctx.stroke();
  // damage cracks when low
  if (cond <= 60) {
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(14,8); ctx.lineTo(17,11); ctx.lineTo(15,14); ctx.stroke();
  }
  if (cond <= 30) {
    ctx.beginPath(); ctx.moveTo(22,8); ctx.lineTo(20,11); ctx.lineTo(23,13); ctx.stroke();
  }
}

function drawGauge(canvas, speed, maxSpeed) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h - 10, r = Math.min(cx, cy) - 6;
  const a0 = Math.PI * 0.8;   // start (left-down)
  const a1 = Math.PI * 2.2;   // end (right-down)
  const redStart = a0 + (a1 - a0) * 0.82;
  const s = clamp(speed, 0, maxSpeed);
  const frac = s / maxSpeed;
  const ang = a0 + (a1 - a0) * frac;

  // background arc
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
  // filled arc
  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, '#3ee6b0'); grad.addColorStop(0.6, '#ffcc4d'); grad.addColorStop(1, '#ff6b5a');
  ctx.strokeStyle = grad; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, ang); ctx.stroke();
  // redline
  ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(cx, cy, r, redStart, a1); ctx.stroke();
  // ticks
  for (let i = 0; i <= 10; i++) {
    const f = i / 10;
    const a = a0 + (a1 - a0) * f;
    const inner = r - (i % 5 === 0 ? 14 : 10);
    const outer = r - 2;
    ctx.strokeStyle = f >= 0.82 ? '#ff6b5a' : 'rgba(255,255,255,0.45)';
    ctx.lineWidth = i % 5 === 0 ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.stroke();
  }
  // needle
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  ctx.strokeStyle = '#fff'; ctx.fillStyle = '#ff6b5a'; ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(255,107,90,0.8)'; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(r - 12, 0); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

export function createSpeedometer(root) {
  const wrap = el('div', 'hh-panel hh-speedo hh-accent-coral');
  wrap.innerHTML = `
    <div class="hh-speedo-top">
      <canvas class="hh-speed-gauge" width="140" height="90"></canvas>
      <div class="hh-speed-readout">
        <div><span class="hh-speed-num" data-speed>0</span><span class="hh-speed-unit">KM/H</span></div>
        <div class="hh-gear" data-gear>GEAR N</div>
      </div>
    </div>
    <div class="hh-speed-car" data-car>On Foot</div>
    <div class="hh-speed-bottom">
      <canvas class="hh-damage-icon" data-damage width="34" height="20"></canvas>
      <div class="hh-speed-cond-wrap">
        <div class="hh-bar-bg" style="height:10px"><div class="hh-bar-fill" data-cond style="width:100%;background:linear-gradient(90deg,#3ee6b0,#ffcc4d)"></div></div>
        <div class="hh-speed-meta">
          <span class="hh-caption" style="font-size:9px">CONDITION</span>
          <span class="hh-cond-text" data-cond-text>100%</span>
        </div>
      </div>
    </div>
  `;
  root.appendChild(wrap);
  const gauge = wrap.querySelector('.hh-speed-gauge');
  const speedEl = wrap.querySelector('[data-speed]');
  const carEl = wrap.querySelector('[data-car]');
  const cond = wrap.querySelector('[data-cond]');
  const condText = wrap.querySelector('[data-cond-text]');
  const gearEl = wrap.querySelector('[data-gear]');
  const damageIcon = wrap.querySelector('[data-damage]');
  let lastGauge = -1;
  let lastDamage = -1;

  function update(state) {
    const inCar = !!state.player?.inCar;
    const car = state.car || {};
    const speed = inCar ? Math.abs(Number(car.speed ?? state.speed ?? 0)) * 3.6 : 0;
    const shown = Math.round(speed);
    speedEl.textContent = shown;
    carEl.textContent = inCar ? (car.name || 'Vehicle') : 'On Foot';
    const c = clamp(Number(car.condition ?? (inCar ? 100 : 0)), 0, 100);
    cond.style.width = c + '%';
    condText.textContent = Math.round(c) + '%';
    cond.style.background = c > 60 ? 'linear-gradient(90deg,#3ee6b0,#ffcc4d)' : c > 30 ? 'linear-gradient(90deg,#ffcc4d,#ff9b4d)' : 'linear-gradient(90deg,#ff6b5a,#ffcc4d)';
    const gear = inCar ? (car.gear ?? 'D') : 'N';
    gearEl.textContent = 'GEAR ' + String(gear).toUpperCase();
    wrap.style.opacity = inCar ? '1' : '0.82';
    const gq = Math.round(shown / 2);
    if (gq !== lastGauge) { drawGauge(gauge, shown, 220); lastGauge = gq; }
    const dq = Math.round(c / 5);
    if (dq !== lastDamage) { drawDamageIcon(damageIcon, c); lastDamage = dq; }
  }
  return { update, el: wrap };
}
