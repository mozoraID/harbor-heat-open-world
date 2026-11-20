// Radio toast pill showing station, genre, and track.
import { el } from './utils.js';

export function createRadioToast(root) {
  const wrap = el('div', 'hh-panel hh-radio hh-accent-mint');
  root.appendChild(wrap);

  function update(state) {
    const r = state.radio;
    if (!r || r.visible === false) { wrap.classList.add('hh-hidden'); return; }
    wrap.classList.remove('hh-hidden');
    if (typeof r === 'string') { wrap.textContent = '♪ ' + r; return; }
    const station = r.station || 'WAVE 101.7';
    const genre = r.genre || '';
    const track = r.track ? ` · '${r.track}'` : '';
    wrap.textContent = `♪ ${station}${genre ? ' — ' + genre : ''}${track}`;
  }
  return { update, el: wrap };
}
