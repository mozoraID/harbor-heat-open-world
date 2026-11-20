// Health and armour bars.
import { el, clamp } from './utils.js';

export function createVitals(root) {
  const wrap = el('div', 'hh-panel hh-vitals hh-accent-mint');
  wrap.innerHTML = `
    <div class="hh-vital-row">
      <div class="hh-vital-label">Health</div>
      <div class="hh-bar-bg"><div class="hh-bar-fill" data-health style="width:100%;background:linear-gradient(90deg,#2ddc88,#3ee6b0)"></div></div>
    </div>
    <div class="hh-vital-row">
      <div class="hh-vital-label">Armour</div>
      <div class="hh-bar-bg"><div class="hh-bar-fill" data-armour style="width:0%;background:linear-gradient(90deg,#4aa8ff,#5cc8ff)"></div></div>
    </div>
  `;
  root.appendChild(wrap);
  const h = wrap.querySelector('[data-health]');
  const a = wrap.querySelector('[data-armour]');

  function update(state) {
    const hp = clamp(Number(state.player?.health ?? 100), 0, 100);
    const ar = clamp(Number(state.player?.armour ?? 0), 0, 100);
    h.style.width = hp + '%';
    a.style.width = ar + '%';
  }
  return { update, el: wrap };
}
