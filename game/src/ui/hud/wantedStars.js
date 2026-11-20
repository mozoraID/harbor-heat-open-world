// Wanted stars display with flashing during search and HEAT meter toward next star.
import { el, clamp } from './utils.js';

export function createWantedStars(root) {
  const wrap = el('div');
  wrap.innerHTML = `
    <div class="hh-stars" data-stars></div>
    <div class="hh-heat" data-heat>
      <span class="hh-heat-label">HEAT</span>
      <div class="hh-heat-track"><div class="hh-heat-fill" data-heat-fill></div></div>
    </div>
  `;
  root.appendChild(wrap);
  const starsEl = wrap.querySelector('[data-stars]');
  const heatWrap = wrap.querySelector('[data-heat]');
  const heatFill = wrap.querySelector('[data-heat-fill]');

  function update(state) {
    const wantedRaw = Number(state.player?.wanted ?? 0);
    const wanted = Math.max(0, Math.min(5, Math.round(wantedRaw)));
    const searching = !!(state.wanted?.searching);
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const on = i <= wanted;
      const cls = 'hh-star' + (on ? ' on' : '') + (on && searching ? ' flash' : '');
      html += `<span class="${cls}">★</span>`;
    }
    if (starsEl._html !== html) { starsEl.innerHTML = html; starsEl._html = html; }

    // HEAT progress toward next star (0..1). Accept several optional fields.
    let prog = null;
    if (state.wanted && state.wanted.heat != null) prog = Number(state.wanted.heat);
    else if (state.wanted && state.wanted.progress != null) prog = Number(state.wanted.progress);
    else if (state.player && state.player.heat != null) prog = Number(state.player.heat);
    else if (wantedRaw > wanted && wantedRaw < 5) prog = wantedRaw - wanted;
    if (prog == null || !isFinite(prog) || wanted >= 5) {
      heatWrap.style.display = 'none';
    } else {
      prog = clamp(prog, 0, 1);
      heatWrap.style.display = 'flex';
      heatFill.style.width = (prog * 100) + '%';
    }
  }
  return { update, el: wrap };
}
