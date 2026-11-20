// Respect rank name and XP progress bar.
import { el, clamp } from './utils.js';

export function createRankBar(root) {
  const wrap = el('div', 'hh-panel hh-rank hh-accent-gold');
  wrap.innerHTML = `
    <div class="hh-caption">RESPECT</div>
    <div class="hh-rank-name" data-rank-name>Street Rat</div>
    <div class="hh-bar-bg"><div class="hh-bar-fill" data-rank-fill style="width:0%;background:linear-gradient(90deg,#ffcc4d,#ff6b5a)"></div></div>
    <div class="hh-caption" data-rank-xp style="margin-top:3px;color:#d7deea">0 / 100 XP</div>
  `;
  root.appendChild(wrap);
  const nameEl = wrap.querySelector('[data-rank-name]');
  const fill = wrap.querySelector('[data-rank-fill]');
  const xpEl = wrap.querySelector('[data-rank-xp]');

  function update(state) {
    const r = state.rank || {};
    nameEl.textContent = r.name || 'Street Rat';
    const xp = Number(r.xp ?? 0);
    const next = Math.max(1, Number(r.next ?? 100));
    const pct = clamp((xp / next) * 100, 0, 100);
    fill.style.width = pct + '%';
    xpEl.textContent = Math.floor(xp) + ' / ' + Math.floor(next) + ' XP';
  }
  return { update, el: wrap };
}
