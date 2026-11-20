// Mission panel: act/number, title, stage pips, objective with highlight, next line, timer.
import { el, fmtCountdown } from './utils.js';

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function highlightObjective(text, keyword) {
  const t = String(text || '');
  if (!keyword) return esc(t);
  const i = t.toLowerCase().indexOf(String(keyword).toLowerCase());
  if (i < 0) return esc(t);
  const k = t.slice(i, i + keyword.length);
  return esc(t.slice(0, i)) + '<span style="color:#ffcc4d">' + esc(k) + '</span>' + esc(t.slice(i + k.length));
}

export function createMissionPanel(root) {
  const wrap = el('div', 'hh-panel hh-mission hh-accent-gold');
  wrap.innerHTML = `
    <div class="hh-caption" data-mission-meta>MISSION 1 · ACT I</div>
    <div class="hh-mission-title" data-mission-title>Harbor Heat</div>
    <div class="hh-pips" data-mission-pips></div>
    <div class="hh-mission-obj" data-mission-obj></div>
    <div class="hh-mission-next" data-mission-next></div>
  `;
  root.appendChild(wrap);
  const meta = wrap.querySelector('[data-mission-meta]');
  const title = wrap.querySelector('[data-mission-title]');
  const pips = wrap.querySelector('[data-mission-pips]');
  const obj = wrap.querySelector('[data-mission-obj]');
  const next = wrap.querySelector('[data-mission-next]');

  function update(state) {
    const m = state.mission || {};
    const num = m.number ?? 1;
    const act = m.act || 'ACT I';
    const timer = fmtCountdown(m.timer);
    meta.textContent = 'MISSION ' + num + ' · ' + String(act).toUpperCase() + (timer ? ' · ' + timer : '');
    title.textContent = m.title || state.hud?.mission || 'Harbor Heat';
    const total = Math.max(1, m.stageTotal ?? 1);
    const cur = Math.max(0, Math.min(total, m.stage ?? 1));
    let p = '';
    for (let i = 1; i <= total; i++) {
      const cls = i < cur ? 'filled' : (i === cur ? 'active' : '');
      p += `<div class="hh-pip ${cls}"></div>`;
    }
    pips.innerHTML = p;
    const objective = m.objective || state.hud?.objective || '';
    obj.innerHTML = highlightObjective(objective, m.highlight);
    next.textContent = m.next ? ('NEXT: ' + m.next) : '';
    next.style.display = m.next ? 'block' : 'none';
  }
  return { update, el: wrap };
}
