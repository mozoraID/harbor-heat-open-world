// Stacked toast notifications.
import { el } from './utils.js';

export function createNotifications(root) {
  const wrap = el('div', 'hh-notifs');
  root.appendChild(wrap);
  let lastKey = '';

  function update(state) {
    const items = Array.isArray(state.notifications) ? state.notifications : (state.toasts || []);
    const key = JSON.stringify(items.slice(-5));
    if (key === lastKey) return;
    lastKey = key;
    wrap.innerHTML = '';
    for (const n of items.slice(-5)) {
      const text = typeof n === 'string' ? n : (n.text || '');
      const tone = (typeof n === 'object' && n.tone) || (text.includes('WANTED') ? 'coral' : text.startsWith('+') ? 'mint' : 'gold');
      const t = el('div', `hh-panel hh-toast hh-accent-${tone}`, text);
      wrap.appendChild(t);
    }
  }
  return { update, el: wrap };
}
