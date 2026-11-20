// Controls reference card overlay.
import { injectMenuStyles } from './menuStyles.js';

const DEFAULT_CONTROLS = [
  ['Move', 'W A S D'], ['Look', 'Mouse'], ['Sprint', 'Shift'], ['Jump / Handbrake', 'Space'],
  ['Enter / Exit Car', 'F'], ['Interact', 'F'], ['Phone', 'P'], ['Radio', 'R'],
  ['Pause / Map', 'Esc'], ['Weapon Slots', '1 - 6'], ['Aim / Fire', 'Mouse'],
];

export function createControlsCard(rootEl, callbacks = {}) {
  injectMenuStyles();
  const root = document.createElement('div');
  root.className = 'hh-menu-root hh-hidden';
  root.innerHTML = `
    <div class="hh-overlay" style="align-items:center;justify-content:center;">
      <div class="hh-controls-card">
        <div class="hh-close-x" data-close>×</div>
        <div style="font-size:22px;font-weight:900;letter-spacing:2px;color:#ffcc4d;text-transform:uppercase;">Controls</div>
        <div class="hh-controls-grid" data-grid></div>
        <div style="margin-top:14px;text-align:right;"><button class="hh-action-btn hh-action-secondary" data-close>Close</button></div>
      </div>
    </div>
  `;
  rootEl.appendChild(root);
  const grid = root.querySelector('[data-grid]');

  function render(list) {
    const rows = Array.isArray(list) && list.length ? list : DEFAULT_CONTROLS;
    grid.innerHTML = rows.map(([action, key]) => `<div class="hh-control-row"><span>${action}</span><span class="hh-keycap">${key}</span></div>`).join('');
  }
  render();

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target.classList.contains('hh-overlay') && e.target === root.firstElementChild) {
      callbacks.onClose && callbacks.onClose();
      hide();
    }
  });

  function show(data) { if (data?.controls) render(data.controls); root.classList.remove('hh-hidden'); }
  function hide() { root.classList.add('hh-hidden'); }
  function update() {}
  return { show, hide, update, el: root };
}
