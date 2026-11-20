// Toggleable feature checklist panel (key H) listing Harbor Heat systems.
export function createFeatureChecklist(rootEl = document.body) {
  const styleId = 'hh-flow-checklist-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .hh-checklist { position:fixed; right:14px; bottom:14px; z-index:80; width:320px; max-width:calc(100vw - 28px); font-family:"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; color:#fff; }
      .hh-checklist .panel { background:rgba(14,18,32,0.82); border-radius:10px; padding:10px 12px; border:1px solid rgba(255,255,255,0.12); border-left:3px solid #3ee6b0; box-shadow:0 8px 24px rgba(0,0,0,0.4); }
      .hh-checklist .title { font-size:12px; font-weight:900; letter-spacing:1.6px; text-transform:uppercase; color:#3ee6b0; margin-bottom:6px; display:flex; justify-content:space-between; }
      .hh-checklist ul { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:1fr 1fr; gap:4px 10px; }
      .hh-checklist li { font-size:11px; font-weight:700; color:#e8eef7; line-height:1.25; }
      .hh-checklist li::before { content:'✔ '; color:#3ee6b0; font-weight:900; }
      .hh-checklist .hint { font-size:10px; color:#aab6c5; margin-top:6px; text-align:right; }
      .hh-checklist.hidden { display:none; }
    `;
    document.head.appendChild(style);
  }

  const root = document.createElement('div');
  root.className = 'hh-checklist';
  const items = [
    'Open city, 6 districts',
    'On foot + 8 vehicle types',
    'Traffic + pedestrians',
    'Car theft',
    '5-star SHP police, dispatch',
    'Roadblocks & HERON-1',
    '6 weapons',
    '9 story missions, 3 acts',
    '5 side activities',
    'Respect ranks',
    '3 save slots',
    'Pause map',
    'Phone',
    '3 radio stations',
    'Synthesized audio',
  ];
  root.innerHTML = `<div class="panel">
    <div class="title"><span>Harbor Heat Systems</span><span>15/15</span></div>
    <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
    <div class="hint">Press H to toggle</div>
  </div>`;
  rootEl.appendChild(root);

  let visible = true;
  function show() { visible = true; root.classList.remove('hidden'); }
  function hide() { visible = false; root.classList.add('hidden'); }
  function toggle() { visible ? hide() : show(); }
  function update() {}
  function setCompactTitleMode(on) {
    root.style.right = on ? '14px' : '14px';
    root.style.bottom = on ? '14px' : '14px';
  }
  return { show, hide, toggle, update, el: root, isVisible: () => visible, setCompactTitleMode };
}
