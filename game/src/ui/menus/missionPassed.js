// MISSION PASSED banner with cash and respect rewards.
import { injectMenuStyles } from './menuStyles.js';
function fmtMoney(n){ return 'S$ ' + (Math.floor(Number(n)||0)).toLocaleString('en-US'); }

export function createMissionPassed(rootEl, callbacks = {}) {
  injectMenuStyles();
  const root = document.createElement('div');
  root.className = 'hh-menu-root hh-hidden';
  root.style.pointerEvents = 'none';
  root.innerHTML = `
    <div class="hh-mission-passed">
      <div class="hh-passed-banner">
        <div class="hh-passed-title" data-title>MISSION PASSED</div>
        <div class="hh-passed-rewards" data-rewards>+S$ 0  +0 RESPECT</div>
      </div>
    </div>
  `;
  rootEl.appendChild(root);
  const titleEl = root.querySelector('[data-title]');
  const rewardsEl = root.querySelector('[data-rewards]');
  let timer = null;

  function show(data = {}) {
    titleEl.textContent = data.title || 'MISSION PASSED';
    const cash = data.cash ?? data.money ?? data.rewardMoney ?? 0;
    const respect = data.respect ?? data.rewardRespect ?? 0;
    rewardsEl.textContent = `+${fmtMoney(cash)}  +${Math.floor(respect).toLocaleString('en-US')} RESPECT`;
    root.classList.remove('hh-hidden');
    clearTimeout(timer);
    const ms = data.duration ?? 4000;
    timer = setTimeout(() => { hide(); callbacks.onDone && callbacks.onDone(); }, ms);
  }
  function hide() { root.classList.add('hh-hidden'); clearTimeout(timer); }
  function update() {}
  return { show, hide, update, el: root };
}
