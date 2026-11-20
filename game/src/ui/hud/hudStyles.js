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
      text-shadow: 0 1px 2px rgba(0,0,0,0.55);
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
      letter-spacing: 1.6px; opacity: 0.95;
    }
    .hh-muted { color: #c9d3df; font-weight: 700; }
    .hh-top-left { position: absolute; left: 18px; top: 16px; display: flex; flex-direction: column; gap: 8px; width: 380px; }
    .hh-top-right { position: absolute; right: 18px; top: 16px; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .hh-bottom-left { position: absolute; left: 18px; bottom: 18px; display: flex; align-items: flex-end; gap: 12px; }
    .hh-bottom-right { position: absolute; right: 18px; bottom: 18px; text-align: right; display:flex; flex-direction:column; align-items:flex-end; }
    .hh-bottom-center { position: absolute; left: 490px; right: 320px; bottom: 22px; display: flex; justify-content: center; }
    .hh-center-top { position: absolute; left: 50%; top: 14%; transform: translateX(-50%); text-align: center; }
    .hh-center-mid { position: absolute; left: 50%; top: 46%; transform: translateX(-50%); }

    /* Mission */
    .hh-mission { padding: 10px 12px; }
    .hh-mission-head { display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .hh-mission-tag { background: linear-gradient(90deg,#ff6b5a,#ffcc4d); color:#111; font-size:11px; font-weight:900; letter-spacing:1px; padding:3px 8px; border-radius:4px; text-transform:uppercase; white-space:nowrap; }
    .hh-mission-meta { font-size:10px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; color:#d7e3f0; }
    .hh-mission-title { font-size: 24px; font-weight: 900; margin-top: 4px; line-height:1.05; letter-spacing:0.3px; }
    .hh-mission-obj { font-size: 13px; margin-top: 8px; color: #eef3f8; font-weight: 700; }
    .hh-mission-next { font-size: 11px; margin-top: 6px; color: #ffcc4d; font-weight:800; letter-spacing:0.5px; }
    .hh-pips { display: flex; gap: 5px; margin-top: 8px; }
    .hh-pip { width: 26px; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.08); }
    .hh-pip.filled { background: #3ee6b0; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.15); }
    .hh-pip.active { background: #ffcc4d; box-shadow: 0 0 10px rgba(255,204,77,0.7); }
    .hh-timer-track { height:4px; background:rgba(255,255,255,0.12); border-radius:3px; margin-top:8px; overflow:hidden; }
    .hh-timer-fill { height:100%; background:linear-gradient(90deg,#ff6b5a,#ffcc4d); border-radius:3px; width:100%; transform-origin:left center; transition: width 0.15s linear; }

    /* Dispatch */
    .hh-dispatch { padding: 8px 10px; }
    .hh-dispatch-header { display:flex; justify-content:space-between; align-items:center; color:#5cc8ff; }
    .hh-dispatch-row { display:flex; align-items:center; gap:8px; font-size:12px; margin-top:0; padding:4px 6px; border-radius:4px; }
    .hh-dispatch-row.alt { background: rgba(255,255,255,0.06); }
    .hh-dispatch-icon { width:26px; height:18px; flex:0 0 auto; }
    .hh-dispatch-call { width:82px; font-weight:800; }
    .hh-dispatch-dist { width:48px; text-align:right; color:#d7deea; }
    .hh-dispatch-rows { margin-top:4px; display:flex; flex-direction:column; gap:2px; }
    .hh-tag { font-size:10px; font-weight:900; letter-spacing:1px; padding:2px 6px; border-radius:4px; color:#081018; }
    .hh-tag-RAMMING,.hh-tag-PIT { background:#ff6b5a; color:#fff; }
    .hh-tag-FLANKING { background:#ff9b4d; }
    .hh-tag-ROADBLOCK { background:#ffcc4d; }
    .hh-tag-SPOTLIGHT { background:#5cc8ff; }
    .hh-tag-PURSUIT { background:#ff7ad1; }
    .hh-tag-SEARCHING { background:#9aa6b2; }
    .hh-dispatch-footer { margin-top:6px; padding:4px 8px; background:rgba(255,204,77,0.18); border:1px solid rgba(255,204,77,0.5); color:#ffcc4d; font-size:11px; font-weight:900; letter-spacing:1.4px; text-align:center; border-radius:4px; }

    /* Top-right money/stars/heat */
    .hh-money { font-size: 34px; font-weight: 900; color: #3ee6b0; letter-spacing: 0.5px; line-height:1; }
    .hh-clock { font-size: 18px; font-weight: 800; }
    .hh-stars { font-size: 28px; letter-spacing: 3px; line-height:1; }
    .hh-star { color: #2a303a; text-shadow: -1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 1px 1px 0 #111, 0 1px 2px rgba(0,0,0,0.8); }
    .hh-star.on { color: #ffcc4d; text-shadow: -1px -1px 0 #5a3b00, 1px -1px 0 #5a3b00, -1px 1px 0 #5a3b00, 1px 1px 0 #5a3b00, 0 0 10px rgba(255,204,77,0.8), 0 0 18px rgba(255,204,77,0.35); }
    .hh-star.flash { animation: hh-flash 0.45s infinite alternate; }
    @keyframes hh-flash { from { color:#8a6a10; text-shadow:-1px -1px 0 #332,1px -1px 0 #332,-1px 1px 0 #332,1px 1px 0 #332,0 0 4px rgba(255,204,77,0.3); } to { color:#ffe28a; text-shadow:-1px -1px 0 #5a3b00,1px -1px 0 #5a3b00,-1px 1px 0 #5a3b00,1px 1px 0 #5a3b00,0 0 14px rgba(255,204,77,1),0 0 26px rgba(255,80,80,0.5); } }
    .hh-heat { display:flex; align-items:center; gap:6px; margin-top:3px; justify-content:flex-end; }
    .hh-heat-label { font-size:9px; font-weight:900; letter-spacing:1.4px; color:#ff9b4d; }
    .hh-heat-track { width:120px; height:6px; background:rgba(255,255,255,0.12); border-radius:3px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); }
    .hh-heat-fill { height:100%; width:0%; background:linear-gradient(90deg,#ffcc4d,#ff6b5a); box-shadow:0 0 8px rgba(255,107,90,0.6); transition: width 0.2s ease; }
    .hh-statusline { font-size: 11px; color: #ff6b5a; letter-spacing: 1px; text-transform: uppercase; font-weight: 900; margin-top:2px; }

    /* Weapon bar (top-right compact) */
    .hh-weaponbar { display:flex; gap:4px; padding:4px 6px; align-items:flex-end; justify-content:flex-end; background: rgba(14,18,32,0.72); border-radius:8px; backdrop-filter: blur(4px); box-shadow: 0 6px 18px rgba(0,0,0,0.35); border-left:3px solid #ffcc4d; }
    .hh-slot { width:52px; height:40px; border-radius:6px; background:rgba(10,14,24,0.7); border:1px solid rgba(255,255,255,0.14); position:relative; overflow:hidden; }
    .hh-slot.active { width:76px; height:50px; border-color:#ffcc4d; box-shadow:0 0 12px rgba(255,204,77,0.4); }
    .hh-slot.locked { opacity:0.35; filter:grayscale(0.7); }
    .hh-slot-num { position:absolute; left:3px; top:1px; font-size:9px; color:#ffcc4d; font-weight:900; }
    .hh-slot-name { position:absolute; left:3px; bottom:10px; right:2px; font-size:8px; font-weight:800; text-transform:uppercase; color:#e8eef7; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .hh-slot-ammo { position:absolute; right:3px; bottom:1px; font-size:9px; color:#3ee6b0; font-weight:800; }
    .hh-slot canvas { position:absolute; right:1px; top:1px; }
    .hh-slot.active canvas { right:3px; top:3px; }

    /* Rank (placed in bottom-right flow) */
    .hh-rank { width:240px; padding:8px 10px; }
    .hh-rank-name { font-size:13px; font-weight:900; color:#ffcc4d; text-transform:uppercase; letter-spacing:1px; }
    .hh-bar-bg { height:8px; background:rgba(255,255,255,0.12); border-radius:4px; overflow:hidden; margin-top:4px; }
    .hh-bar-fill { height:100%; border-radius:4px; }

    /* Vitals */
    .hh-vitals { width:204px; padding:8px 10px; }
    .hh-vital-row { margin-top:4px; }
    .hh-vital-label { font-size:10px; letter-spacing:1.2px; text-transform:uppercase; color:#d7deea; }

    /* Minimap */
    .hh-minimap-wrap { display:flex; flex-direction:column; align-items:center; gap:4px; }
    .hh-minimap { width:245px; height:245px; display:block; background:transparent; border:none; border-radius:50%; box-shadow:none; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.45)); }
    .hh-district-label { font-size:11px; text-transform:uppercase; letter-spacing:1.4px; color:#5cc8ff; font-weight:900; text-shadow:0 1px 3px rgba(0,0,0,0.8); }

    /* Speedo */
    .hh-speedo { padding:8px 12px 10px; min-width:280px; }
    .hh-speedo-top { display:flex; align-items:center; justify-content:center; gap:6px; }
    .hh-speed-gauge { width:140px; height:90px; flex:0 0 auto; }
    .hh-speed-readout { text-align:left; }
    .hh-speed-num { font-size:44px; font-weight:900; line-height:0.95; }
    .hh-speed-unit { font-size:13px; color:#ffcc4d; margin-left:2px; font-weight:900; }
    .hh-speed-car { font-size:13px; color:#e8eef7; margin-top:2px; text-align:center; }
    .hh-speed-bottom { display:flex; align-items:center; gap:8px; margin-top:6px; }
    .hh-damage-icon { width:34px; height:20px; flex:0 0 auto; }
    .hh-speed-cond-wrap { flex:1; }
    .hh-speed-meta { display:flex; justify-content:space-between; align-items:center; margin-top:3px; }
    .hh-gear { font-size:11px; font-weight:900; color:#ffcc4d; letter-spacing:1px; }
    .hh-cond-text { font-size:11px; font-weight:900; color:#d7deea; }

    /* Radio, dialogue, misc */
    .hh-radio { position:absolute; left:18px; bottom:360px; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:800; }
    .hh-dialogue { width:100%; max-width:520px; padding:10px 12px; display:flex; gap:12px; align-items:flex-start; }
    .hh-portrait { width:72px; height:72px; border-radius:8px; background:#111; flex:0 0 auto; border:2px solid rgba(255,255,255,0.15); }
    .hh-dialogue-name { font-size:14px; font-weight:900; color:#ffcc4d; }
    .hh-dialogue-role { font-size:10px; letter-spacing:1.2px; text-transform:uppercase; color:#5cc8ff; margin-left:8px; }
    .hh-dialogue-text { font-size:14px; font-weight:700; color:#f4f7fb; margin-top:4px; line-height:1.35; }
    .hh-notifs { position:absolute; right:18px; top:300px; display:flex; flex-direction:column; gap:6px; align-items:flex-end; }
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
    .hh-hud.hh-phone-open .hh-top-right,
    .hh-hud.hh-phone-open .hh-bottom-right,
    .hh-hud.hh-phone-open .hh-bottom-center,
    .hh-hud.hh-phone-open .hh-notifs { display:none; }
    .hh-hidden { display:none !important; }
  `;
  document.head.appendChild(style);
}
