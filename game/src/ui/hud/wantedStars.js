// Wanted stars display with flashing during search.
import { el } from './utils.js';

export function createWantedStars(root) {
  const wrap = el('div', 'hh-stars');
  root.appendChild(wrap);
  function update(state) {
    const wanted = Math.max(0, Math.min(5, Math.round(state.player?.wanted ?? 0)));
    const searching = !!(state.wanted?.searching);
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const on = i <= wanted;
      const cls = 'hh-star' + (on ? ' on' : '') + (on && searching ? ' flash' : '');
      html += `<span class="${cls}">★</span>`;
    }
    if (wrap._html !== html) { wrap.innerHTML = html; wrap._html = html; }
  }
  return { update, el: wrap };
}
