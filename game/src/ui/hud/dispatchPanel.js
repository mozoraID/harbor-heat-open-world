// SHP Dispatch panel: header with unit/star counts and police unit rows.
import { el } from './utils.js';

const TAG_CLASS = {
  RAMMING: 'hh-tag-RAMMING', PIT: 'hh-tag-PIT', FLANKING: 'hh-tag-FLANKING',
  ROADBLOCK: 'hh-tag-ROADBLOCK', SPOTLIGHT: 'hh-tag-SPOTLIGHT',
  PURSUIT: 'hh-tag-PURSUIT', SEARCHING: 'hh-tag-SEARCHING'
};

export function createDispatchPanel(root) {
  const wrap = el('div', 'hh-panel hh-dispatch hh-accent-sky');
  root.appendChild(wrap);

  function update(state) {
    const d = state.dispatch || {};
    const units = Array.isArray(d.units) ? d.units : [];
    const shown = units.slice(0, 4);
    const more = Math.max(0, (d.more ?? (units.length - shown.length)));
    const stars = d.stars ?? state.player?.wanted ?? 0;
    let html = `<div class="hh-dispatch-header hh-caption"><span>SHP DISPATCH</span><span>${units.length} UNITS · ${'★'.repeat(Math.max(0, Math.min(5, stars)))}${'☆'.repeat(Math.max(0, 5 - Math.min(5, stars)))}</span></div>`;
    if (shown.length === 0) {
      html += `<div class="hh-muted" style="font-size:12px;margin-top:4px">NO ACTIVE UNITS</div>`;
    }
    for (const u of shown) {
      const tag = String(u.tag || 'PURSUIT').toUpperCase();
      const cls = TAG_CLASS[tag] || 'hh-tag-PURSUIT';
      const dist = u.distance != null ? Math.round(u.distance) + 'm' : '--';
      html += `<div class="hh-dispatch-row">
        <span style="width:14px;text-align:center">${u.icon || '🚓'}</span>
        <span class="hh-dispatch-call">${u.callSign || 'UNIT'}</span>
        <span class="hh-dispatch-dist">${dist}</span>
        <span class="hh-tag ${cls}">${tag}</span>
      </div>`;
    }
    if (more > 0) html += `<div class="hh-muted" style="font-size:11px;margin-top:4px">+${more} MORE</div>`;
    if (wrap._html !== html) { wrap.innerHTML = html; wrap._html = html; }
    wrap.style.display = (d.visible === false) ? 'none' : 'block';
  }
  return { update, el: wrap };
}
