// Mission panel: act/number tag, large title, stage pips, objective with highlight, next line, animated timer bar.
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
    <div class="hh-mission-head">
      <div class="hh-mission-tag" data-mission-tag>MISSION 1</div>
      <div class="hh-mission-meta" data-mission-meta>ACT I</div>
    </div>
    <div class="hh-mission-title" data-mission-title>Harbor Heat</div>
    <div class="hh-pips" data-mission-pips></div>
    <div class="hh-mission-obj" data-mission-obj></div>
    <div class="hh-mission-next" data-mission-next></div>
    <div class="hh-timer-track" data-timer-track><div class="hh-timer-fill" data-timer-fill></div></div>
  `;
  root.appendChild(wrap);
  const tag = wrap.querySelector('[data-mission-tag]');
  const meta = wrap.querySelector('[data-mission-meta]');
  const title = wrap.querySelector('[data-mission-title]');
  const pips = wrap.querySelector('[data-mission-pips]');
  const obj = wrap.querySelector('[data-mission-obj]');
  const next = wrap.querySelector('[data-mission-next]');
  const timerTrack = wrap.querySelector('[data-timer-track]');
  const timerFill = wrap.querySelector('[data-timer-fill]');

  let timerKey = '';
  let timerMax = 0;

  function update(state) {
    const m = state.mission || {};
    const num = m.number ?? 1;
    const act = m.act || 'ACT I';
    tag.textContent = 'MISSION ' + num;
    meta.textContent = String(act).toUpperCase();
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

    // timer progress bar
    if (m.timer != null && isFinite(m.timer)) {
      const key = `${num}-${cur}-${m.title || ''}`;
      if (key !== timerKey) { timerKey = key; timerMax = Math.max(m.timer, 1); }
      if (m.timer > timerMax) timerMax = m.timer;
      const frac = Math.max(0, Math.min(1, m.timer / Math.max(1, timerMax)));
      timerTrack.style.display = 'block';
      timerFill.style.width = (frac * 100) + '%';
      timerFill.style.background = frac < 0.25 ? 'linear-gradient(90deg,#ff3b3b,#ff6b5a)' : 'linear-gradient(90deg,#ff6b5a,#ffcc4d)';
      meta.textContent = String(act).toUpperCase() + ' · ' + fmtCountdown(m.timer);
    } else {
      timerTrack.style.display = 'none';
      timerKey = ''; timerMax = 0;
    }
  }
  return { update, el: wrap };
}
