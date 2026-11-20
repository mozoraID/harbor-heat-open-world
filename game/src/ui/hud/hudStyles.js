// Injects HUD styles once into the document.
export function injectHudStyles() {
  if (document.getElementById('harbor-heat-hud-styles')) return;
  const style = document.createElement('style');
  style.id = 'harbor-heat-hud-styles';
  style.textContent = `
    .hh-hud, .hh-hud * { box-sizing: border-box; }
    .hh-hud {
      position: fixed; inset: 0; pointer-events: none;
      font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #fff; font-weight: 700; line-height: 1.2;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    .hh-panel {
      background: rgba(14,18,32,0.72);
      border-radius: 8px;
      backdrop-filter: blur(4px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.35);
    }
    .hh-accent-coral { border-left: 3px solid #ff6b5a; }
    .hh-accent-mint { border-left: 3px solid #3ee6b0; }
    .hh-accent-gold { border-left: 3px solid #ffcc4d; }
    .hh-accent-sky { border-left: 3px solid #5cc8ff; }
    .hh-caption {
      font-size: 10px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 1.6px; opacity: 0.9;
    }
    .hh-muted { color: #c9d3df; font-weight: 700; }
    .hh-top-left { position: absolute; left: 18px; top: 16px; display: flex; flex-direction: column; gap: 8px; width: 360px; }
    .hh-top-right { position: absolute; right: 18px; top: 16px; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .hh-bottom-left { position: absolute; left: 18px; bottom: 18px; display: flex; align-items: flex-end; gap: 12px; }
    .hh-bottom-right { position: absolute; right: 18px; bottom: 18px; text-align: right; }
    .hh-bottom-center { position: absolute; left: 50%; bottom: 100px; transform: translateX(-50%); }
    .hh-center-top { position: absolute; left: 50%; top: 14%; transform: translateX(-50%); text-align: center; }
    .hh-center-mid { position: absolute; left: 50%; top: 48%; transform: translateX(-50%); }
    .hh-mission { padding: 10px 12px; }
    .hh-mission-title { font-size: 18px; font-weight: 900; margin-top: 2px; }
    .hh-mission-obj { font-size: 13px; margin-top: 6px; color: #eef3f8; font-weight: 700; }
    .hh-mission-next { font-size: 11px; margin-top: 6px; color: #ffcc4d; }
    .hh-pips { display: flex; gap: 4px; margin-top: 6px; }
    .hh-pip { width: 18px; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.18); }
    .hh-pip.filled { background: #3ee6b0; }
    .hh-pip.active { background: #ffcc4d; box-shadow: 0 0 8px rgba(255,204,77,0.7); }
    .hh-dispatch { padding: 8px 10px; }
    .hh-dispatch-header { display:flex; justify-content:space-between; align-items:center; color:#5cc8ff; }
    .hh-dispatch-row { display:flex; align-items:center; gap:8px; font-size:12px; margin-top:5px; }
    .hh-dispatch-call { width:86px; font-weight:800; }
    .hh-dispatch-dist { width:52px; text-align:right; color:#d7deea; }
    .hh-tag { font-size:10px; font-weight:900; letter-spacing:1px; padding:2px 6px; border-radius:4px; color:#081018; }
    .hh-tag-RAMMING,.hh-tag-PIT { background:#ff6b5a; color:#fff; }
    .hh-tag-FLANKING { background:#ff9b4d; }
    .hh-tag-ROADBLOCK { background:#ffcc4d; }
    .hh-tag-SPOTLIGHT { background:#5cc8ff; }
    .hh-tag-PURSUIT { background:#ff7ad1; }
    .hh-tag-SEARCHING { background:#9aa6b2; }
    .hh-money { font-size: 34px; font-weight: 900; color: #3ee6b0; letter-spacing: 0.5px; }
    .hh-clock { font-size: 18px; font-weight: 800; }
    .hh-stars { font-size: 20px; letter-spacing: 2px; }
    .hh-star { color: #445; }
    .hh-star.on { color: #ffcc4d; text-shadow: 0 0 8px rgba(255,204,77,0.6); }
    .hh-star.flash { animation: hh-flash 0.5s infinite alternate; }
    @keyframes hh-flash { from { opacity: 0.3; } to { opacity: 1; color: #5cc8ff; } }
    .hh-statusline { font-size: 12px; color: #ff6b5a; letter-spacing: 1px; text-transform: uppercase; font-weight: 900; }
    .hh-weaponbar { position:absolute; left:50%; bottom:18px; transform:translateX(-50%); display:flex; gap:6px; padding:6px; }
    .hh-slot { width:74px; height:54px; border-radius:6px; background:rgba(14,18,32,0.72); border:1px solid rgba(255,255,255,0.12); position:relative; overflow:hidden; }
    .hh-slot.active { border-color:#ffcc4d; box-shadow:0 0 10px rgba(255,204,77,0.35); }
    .hh-slot.locked { opacity:0.35; filter:grayscale(0.6); }
    .hh-slot-num { position:absolute; left:4px; top:2px; font-size:10px; color:#ffcc4d; }
    .hh-slot-name { position:absolute; left:4px; bottom:14px; font-size:9px; font-weight:800; text-transform:uppercase; color:#e8eef7; }
    .hh-slot-ammo { position:absolute; right:4px; bottom:2px; font-size:10px; color:#3ee6b0; }
    .hh-slot canvas { position:absolute; right:2px; top:2px; }
    .hh-rank { position:absolute; right:18px; bottom:150px; width:220px; padding:8px 10px; }
    .hh-rank-name { font-size:13px; font-weight:900; color:#ffcc4d; text-transform:uppercase; letter-spacing:1px; }
    .hh-bar-bg { height:8px; background:rgba(255,255,255,0.12); border-radius:4px; overflow:hidden; margin-top:4px; }
    .hh-bar-fill { height:100%; border-radius:4px; }
    .hh-vitals { width:190px; padding:8px 10px; }
    .hh-vital-row { margin-top:4px; }
    .hh-vital-label { font-size:10px; letter-spacing:1.2px; text-transform:uppercase; color:#d7deea; }
    .hh-minimap-wrap { display:flex; flex-direction:column; align-items:center; gap:4px; }
    .hh-minimap { width:170px; height:170px; border-radius:50%; background:rgba(8,12,18,0.8); border:2px solid rgba(255,255,255,0.22); box-shadow:0 4px 20px rgba(0,0,0,0.45); }
    .hh-district-label { font-size:11px; text-transform:uppercase; letter-spacing:1.4px; color:#5cc8ff; font-weight:900; }
    .hh-speedo { padding:10px 14px; min-width:240px; }
    .hh-speed-num { font-size:42px; font-weight:900; line-height:1; }
    .hh-speed-unit { font-size:14px; color:#ffcc4d; margin-left:4px; }
    .hh-speed-car { font-size:13px; color:#e8eef7; margin-top:2px; }
    .hh-radio { position:absolute; left:18px; bottom:250px; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:800; }
    .hh-dialogue { width:620px; max-width:calc(100vw - 160px); padding:10px 12px; display:flex; gap:12px; align-items:flex-start; }
    .hh-portrait { width:72px; height:72px; border-radius:8px; background:#111; flex:0 0 auto; border:2px solid rgba(255,255,255,0.15); }
    .hh-dialogue-name { font-size:14px; font-weight:900; color:#ffcc4d; }
    .hh-dialogue-role { font-size:10px; letter-spacing:1.2px; text-transform:uppercase; color:#5cc8ff; margin-left:8px; }
    .hh-dialogue-text { font-size:14px; font-weight:700; color:#f4f7fb; margin-top:4px; line-height:1.35; }
    .hh-notifs { position:absolute; right:18px; top:170px; display:flex; flex-direction:column; gap:6px; align-items:flex-end; }
    .hh-toast { padding:6px 10px; font-size:13px; font-weight:900; animation: hh-toast-in 0.2s ease-out; }
    @keyframes hh-toast-in { from { transform:translateY(-6px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .hh-district-banner { font-size:44px; font-weight:900; letter-spacing:2px; text-transform:uppercase; padding:10px 22px; color:#fff; opacity:0; transition: opacity 0.5s ease; }
    .hh-district-banner.show { opacity:1; }
    .hh-crosshair { width:18px; height:18px; position:relative; opacity:0.9; }
    .hh-crosshair:before,.hh-crosshair:after { content:''; position:absolute; background:#fff; box-shadow:0 0 2px #000; }
    .hh-crosshair:before { left:8px; top:0; width:2px; height:18px; }
    .hh-crosshair:after { top:8px; left:0; width:18px; height:2px; }
    .hh-interact { padding:8px 14px; font-size:14px; font-weight:900; display:flex; gap:8px; align-items:center; }
    .hh-key { background:#ffcc4d; color:#111; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:900; }
    .hh-hidden { display:none !important; }
  `;
  document.head.appendChild(style);
}
