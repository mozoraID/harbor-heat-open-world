// Large district name banner that fades in when entering a district.
import { el } from './utils.js';

export function createDistrictBanner(root) {
  const wrap = el('div', 'hh-panel hh-district-banner hh-accent-sky');
  root.appendChild(wrap);
  let last = null;
  let timer = 0;

  function update(state) {
    const name = String(state.districtName || 'Port Solenne').toUpperCase();
    if (name !== last) {
      last = name;
      wrap.textContent = name;
      wrap.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(() => wrap.classList.remove('show'), 2500);
    }
  }
  return { update, el: wrap };
}
