// Money with count-up animation, clock, wanted stars/heat, and status line.
import { el, fmtMoney, fmtClock } from './utils.js';
import { createWantedStars } from './wantedStars.js';

export function createMoneyClock(root) {
  const wrap = el('div');
  const moneyEl = el('div', 'hh-money', 'S$ 0');
  const clockEl = el('div', 'hh-clock', '18:42');
  const starsMount = el('div');
  const statusEl = el('div', 'hh-statusline');
  wrap.append(moneyEl, clockEl, starsMount, statusEl);
  root.appendChild(wrap);
  const stars = createWantedStars(starsMount);

  let displayMoney = null;
  let lastTime = performance.now();

  function update(state) {
    const target = Number(state.player?.money ?? 0);
    if (displayMoney == null) displayMoney = target;
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    const diff = target - displayMoney;
    if (Math.abs(diff) < 0.5) displayMoney = target;
    else displayMoney += diff * Math.min(1, dt * 6);
    moneyEl.textContent = fmtMoney(displayMoney);

    clockEl.textContent = fmtClock(state.timeOfDay ?? state.clock ?? '18:42');
    stars.update(state);

    const status = state.wanted?.status || state.statusLine || '';
    statusEl.textContent = status;
    statusEl.style.display = status ? 'block' : 'none';
  }
  return { update, el: wrap };
}
