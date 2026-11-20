// WASTED overlay with fee and retry/quit actions.
import { injectMenuStyles } from './menuStyles.js';
function fmtMoney(n){ return 'S$ ' + (Math.floor(Number(n)||0)).toLocaleString('en-US'); }

export function createWastedScreen(rootEl, callbacks = {}) {
  injectMenuStyles();
  const root = document.createElement('div');
  root.className = 'hh-menu-root hh-hidden';
  root.innerHTML = `
    <div class="hh-full-overlay hh-wasted">
      <div class="hh-slanted">WASTED</div>
      <div class="hh-fee" data-fee>Hospital fee: S$ 0</div>
      <div class="hh-sub">You flatlined in Port Solenne</div>
      <div class="hh-overlay-actions">
        <button class="hh-action-btn hh-action-primary" data-retry>Retry</button>
        <button class="hh-action-btn hh-action-secondary" data-quit>Quit</button>
      </div>
    </div>
  `;
  rootEl.appendChild(root);
  const feeEl = root.querySelector('[data-fee]');
  root.querySelector('[data-retry]').addEventListener('click', () => callbacks.onRetry && callbacks.onRetry());
  root.querySelector('[data-quit]').addEventListener('click', () => callbacks.onQuit && callbacks.onQuit());

  function show(data = {}) { feeEl.textContent = 'Hospital fee: ' + fmtMoney(data.fee ?? data.cost ?? 500); root.classList.remove('hh-hidden'); }
  function hide() { root.classList.add('hh-hidden'); }
  function update(state) { if (state?.wastedFee != null && !root.classList.contains('hh-hidden')) feeEl.textContent = 'Hospital fee: ' + fmtMoney(state.wastedFee); }
  return { show, hide, update, el: root };
}
