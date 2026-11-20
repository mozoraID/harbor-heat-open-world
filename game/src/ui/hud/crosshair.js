// Simple crosshair at screen center.
import { el } from './utils.js';

export function createCrosshair(root) {
  const wrap = el('div', 'hh-center-mid');
  wrap.innerHTML = '<div class="hh-crosshair"></div>';
  root.appendChild(wrap);
  function update(state) {
    const show = state.crosshair !== false && !(state.dialogue && state.dialogue.visible !== false && state.dialogue.text);
    wrap.style.display = show ? 'block' : 'none';
  }
  return { update, el: wrap };
}
