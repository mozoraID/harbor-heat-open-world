// Interaction prompt like "F  Steal car".
import { el } from './utils.js';

export function createInteractPrompt(root) {
  const wrap = el('div', 'hh-panel hh-interact hh-accent-gold hh-center-mid');
  wrap.style.marginTop = '28px';
  root.appendChild(wrap);

  function update(state) {
    const p = state.interact || state.prompt;
    if (!p) { wrap.classList.add('hh-hidden'); return; }
    wrap.classList.remove('hh-hidden');
    if (typeof p === 'string') { wrap.textContent = p; return; }
    const key = p.key || 'F';
    const action = p.action || p.text || 'Interact';
    wrap.innerHTML = `<span class="hh-key">${key}</span><span>${action}</span>`;
  }
  return { update, el: wrap };
}
