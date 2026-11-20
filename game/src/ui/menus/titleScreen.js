// Title screen: logo, tagline, main menu with continue/new/load/settings/controls/credits over live 3D backdrop.
import { injectMenuStyles } from './menuStyles.js';
import { listSlots, slotDetails, slotSummary } from '../../save/saveSlots.js';

export function createTitleScreen(rootEl, callbacks = {}) {
  injectMenuStyles();
  const root = document.createElement('div');
  root.className = 'hh-menu-root hh-title-screen hh-hidden';
  root.innerHTML = `
    <div class="hh-title-left">
      <div class="hh-logo-wrap">
        <div class="hh-logo">HARBOR<br>HEAT</div>
        <div class="hh-palm"><div class="trunk"></div><div class="leaf l1"></div><div class="leaf l2"></div><div class="leaf l3"></div><div class="leaf l4"></div><div class="leaf l5"></div></div>
      </div>
      <div class="hh-tagline">Port Solenne never sleeps</div>
      <div class="hh-menu-list" data-main>
        <button class="hh-menu-btn" data-action="continue">Continue</button>
        <button class="hh-menu-btn" data-action="new">New Game</button>
        <button class="hh-menu-btn" data-action="load">Load Game</button>
        <button class="hh-menu-btn" data-action="settings">Settings</button>
        <button class="hh-menu-btn" data-action="controls">Controls</button>
        <button class="hh-menu-btn" data-action="credits">Credits</button>
      </div>
      <div class="hh-subpanel hh-hidden" data-load>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-size:14px;letter-spacing:1.2px;text-transform:uppercase;color:#5cc8ff;">Load Game</div>
          <button class="hh-menu-btn" data-back style="width:auto;padding:6px 10px;font-size:12px;">Back</button>
        </div>
        <div class="hh-slot-cards" data-slots></div>
      </div>
      <div class="hh-subpanel hh-hidden" data-settings></div>
      <div class="hh-subpanel hh-hidden" data-credits>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-size:14px;letter-spacing:1.2px;text-transform:uppercase;color:#5cc8ff;">Credits</div>
          <button class="hh-menu-btn" data-back style="width:auto;padding:6px 10px;font-size:12px;">Back</button>
        </div>
        <div class="hh-muted" style="font-size:13px;line-height:1.5;">
          Harbor Heat — an original open-world crime game set in Port Solenne.<br><br>
          Created for the make.fun open-world game bounty.<br>
          Built with Three.js. All code, art, and audio original.
        </div>
      </div>
    </div>
  `;
  rootEl.appendChild(root);

  const main = root.querySelector('[data-main]');
  const loadPanel = root.querySelector('[data-load]');
  const slotsEl = root.querySelector('[data-slots]');
  const settingsPanel = root.querySelector('[data-settings]');
  const creditsPanel = root.querySelector('[data-credits]');
  let settingsUI = null;

  function showPanel(which) {
    main.classList.toggle('hh-hidden', which === 'load' || which === 'settings' || which === 'credits');
    loadPanel.classList.toggle('hh-hidden', which !== 'load');
    settingsPanel.classList.toggle('hh-hidden', which !== 'settings');
    creditsPanel.classList.toggle('hh-hidden', which !== 'credits');
    if (which === 'load') renderSlots();
    if (which === 'settings') renderSettings();
  }

  function renderSlots() {
    const slots = typeof callbacks.getSlots === 'function' ? callbacks.getSlots() : listSlots();
    slotsEl.innerHTML = '';
    for (const entry of slots) {
      const s = slotSummary(entry.data);
      const card = document.createElement('div');
      card.className = 'hh-save-card';
      card.innerHTML = `<div class="hh-save-detail">${slotDetails(entry)}</div>
        <div class="hh-muted hh-save-sub">${s?.savedAt ? `Last saved ${new Date(s.savedAt).toLocaleString()}` : 'No save data yet'}</div>`;
      card.addEventListener('click', () => callbacks.onLoadSlot && callbacks.onLoadSlot(entry.slot, entry.data));
      slotsEl.appendChild(card);
    }
  }

  function renderSettings() {
    if (typeof callbacks.renderSettings === 'function') {
      settingsPanel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="font-size:14px;letter-spacing:1.2px;text-transform:uppercase;color:#5cc8ff;">Settings</div><button class="hh-menu-btn" data-back style="width:auto;padding:6px 10px;font-size:12px;">Back</button></div><div data-settings-body></div>`;
      settingsPanel.querySelector('[data-back]').addEventListener('click', () => showPanel('main'));
      callbacks.renderSettings(settingsPanel.querySelector('[data-settings-body]'));
      return;
    }
    settingsPanel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="font-size:14px;letter-spacing:1.2px;text-transform:uppercase;color:#5cc8ff;">Settings</div><button class="hh-menu-btn" data-back style="width:auto;padding:6px 10px;font-size:12px;">Back</button></div><div class="hh-muted">Settings available in-game.</div>`;
    settingsPanel.querySelector('[data-back]').addEventListener('click', () => showPanel('main'));
  }

  root.addEventListener('click', (e) => {
    const back = e.target.closest('[data-back]');
    if (back) { showPanel('main'); return; }
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = btn.getAttribute('data-action');
    if (a === 'continue') callbacks.onContinue && callbacks.onContinue();
    else if (a === 'new') callbacks.onNewGame && callbacks.onNewGame();
    else if (a === 'load') showPanel('load');
    else if (a === 'settings') showPanel('settings');
    else if (a === 'controls') callbacks.onControls && callbacks.onControls();
    else if (a === 'credits') showPanel('credits');
  });

  function show() { root.classList.remove('hh-hidden'); showPanel('main'); }
  function hide() { root.classList.add('hh-hidden'); }
  function update(state) { if (state?.titleVisible === false) hide(); }
  return { show, hide, update, el: root };
}
