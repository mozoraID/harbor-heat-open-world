// Injects menu and overlay styles once into the document.
export function injectMenuStyles() {
  if (document.getElementById('harbor-heat-menu-styles')) return;
  const style = document.createElement('style');
  style.id = 'harbor-heat-menu-styles';
  style.textContent = `
    .hh-menu-root, .hh-menu-root * { box-sizing: border-box; }
    .hh-menu-root {
      position: fixed; inset: 0; z-index: 50; pointer-events: auto;
      font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #fff; font-weight: 700;
    }
    .hh-title-screen { position:absolute; inset:0; background: transparent; }
    .hh-title-left {
      position:absolute; left:0; top:0; bottom:0; width:420px; padding:36px 32px;
      background: linear-gradient(90deg, rgba(10,12,20,0.78) 0%, rgba(10,12,20,0.55) 70%, rgba(10,12,20,0.0) 100%);
      display:flex; flex-direction:column; gap:18px;
    }
    .hh-logo-wrap { position:relative; margin-bottom:4px; }
    .hh-logo {
      font-size:64px; line-height:0.9; font-weight:900; letter-spacing:2px; text-transform:uppercase;
      background: linear-gradient(180deg, #fff3b0 0%, #ffcc4d 25%, #ff8a5b 55%, #ff4d6d 80%, #6b2cff 100%);
      -webkit-background-clip: text; background-clip: text; color: transparent;
      filter: drop-shadow(0 4px 0 rgba(0,0,0,0.35)) drop-shadow(0 10px 24px rgba(255,90,60,0.35));
    }
    .hh-palm { position:absolute; right:10px; top:-6px; width:90px; height:90px; opacity:0.9; }
    .hh-palm .trunk { position:absolute; bottom:0; left:42px; width:10px; height:46px; background:#1b1b22; border-radius:6px; transform:skewX(-6deg); }
    .hh-palm .leaf { position:absolute; width:46px; height:10px; background:#121826; border-radius:10px 10px 2px 2px; top:20px; left:22px; transform-origin:left center; }
    .hh-palm .l1{ transform:rotate(-20deg);} .hh-palm .l2{ transform:rotate(15deg);} .hh-palm .l3{ transform:rotate(-55deg); width:38px;} .hh-palm .l4{ transform:rotate(50deg); width:38px;} .hh-palm .l5{ transform:rotate(-85deg); width:30px; top:24px;}
    .hh-tagline { font-size:14px; letter-spacing:2px; text-transform:uppercase; color:#ffd8c2; margin-top:-6px; }
    .hh-menu-list { display:flex; flex-direction:column; gap:8px; margin-top:8px; }
    .hh-menu-btn {
      background: rgba(14,18,32,0.72); border:1px solid rgba(255,255,255,0.12); border-left:3px solid #ff6b5a;
      color:#fff; padding:10px 14px; border-radius:8px; font-size:16px; font-weight:800; text-transform:uppercase; letter-spacing:1px;
      cursor:pointer; text-align:left;
    }
    .hh-menu-btn:hover, .hh-menu-btn.active { background: rgba(255,107,90,0.18); border-left-color:#ffcc4d; }
    .hh-subpanel { background: rgba(14,18,32,0.78); border-radius:10px; padding:12px; border:1px solid rgba(255,255,255,0.1); }
    .hh-slot-cards { display:flex; flex-direction:column; gap:8px; }
    .hh-save-card { width:100%; padding:10px 12px; border-radius:8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-left:3px solid #5cc8ff; cursor:pointer; }
    .hh-save-card:hover { background:rgba(92,200,255,0.14); border-left-color:#ffcc4d; }
    .hh-save-detail { font-size:11px; font-weight:800; line-height:1.5; color:#f2f7ff; }
    .hh-save-sub { font-size:10px; margin-top:3px; }
    .hh-muted { color:#aab6c5; font-weight:700; }

    .hh-overlay { position:absolute; inset:0; background: rgba(8,10,16,0.72); backdrop-filter: blur(4px); display:flex; }
    .hh-pause { flex-direction:column; padding:18px 22px; }
    .hh-pause-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    .hh-pause-title { font-size:28px; font-weight:900; letter-spacing:2px; color:#ffcc4d; }
    .hh-tabs { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
    .hh-tab { padding:8px 14px; border-radius:8px; background:rgba(255,255,255,0.06); cursor:pointer; font-weight:800; letter-spacing:1px; text-transform:uppercase; font-size:13px; }
    .hh-tab.active { background:#ff6b5a; color:#fff; }
    .hh-tab-content { flex:1; min-height:0; overflow:hidden; background:rgba(14,18,32,0.72); border-radius:10px; padding:14px; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; }
    .hh-tab-content.scroll { overflow:auto; display:block; }
    .hh-map-layout { flex:1; min-height:0; display:flex; gap:14px; }
    .hh-map-wrap { flex:1; min-width:0; min-height:0; display:flex; align-items:center; justify-content:center; }
    .hh-map-canvas { background:#0f1822; border-radius:8px; display:block; max-width:100%; max-height:100%; }
    .hh-map-side { width:260px; flex:0 0 260px; display:flex; flex-direction:column; gap:12px; overflow:auto; }
    .hh-side-card { background:rgba(255,255,255,0.05); border-radius:8px; padding:10px; border-left:3px solid #5cc8ff; }
    .hh-side-title { font-size:11px; letter-spacing:1.4px; text-transform:uppercase; color:#5cc8ff; margin-bottom:6px; }
    .hh-legend { display:flex; flex-direction:column; gap:8px; font-size:12px; color:#d7deea; }
    .hh-legend span::before { content:''; display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:8px; vertical-align:middle; }
    .hh-leg-mission::before { background:#ffcc4d; } .hh-leg-safe::before { background:#3ee6b0; } .hh-leg-shop::before { background:#5cc8ff; } .hh-leg-player::before { background:#ffffff; } .hh-leg-beach::before { background:#e8c98a; border-radius:2px; } .hh-leg-ocean::before { background:#2f88a8; border-radius:2px; }
    .hh-list { display:flex; flex-direction:column; gap:10px; }
    .hh-act { font-size:14px; color:#5cc8ff; letter-spacing:1.4px; text-transform:uppercase; margin-top:6px; }
    .hh-mission-row { padding:8px 10px; background:rgba(255,255,255,0.04); border-radius:6px; display:flex; justify-content:space-between; }
    .hh-status-done { color:#3ee6b0; } .hh-status-active { color:#ffcc4d; } .hh-status-locked { color:#889; }
    .hh-stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; }
    .hh-stat { background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; }
    .hh-stat .k { font-size:11px; color:#aab6c5; text-transform:uppercase; letter-spacing:1.2px; }
    .hh-stat .v { font-size:20px; font-weight:900; color:#fff; margin-top:2px; }
    .hh-settings-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06); gap:16px; }
    .hh-settings-row label { font-size:14px; }
    .hh-settings-row input[type=range] { width:220px; }
    .hh-save-slots { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:10px; }

    .hh-phone-wrap { position:absolute; right:24px; top:40px; bottom:40px; width:320px; display:flex; align-items:center; justify-content:flex-end; }
    .hh-phone { width:300px; height:560px; max-height:100%; border-radius:28px; background: linear-gradient(180deg,#0b1220,#121826); border:4px solid #222a38; box-shadow:0 20px 50px rgba(0,0,0,0.6); padding:14px 12px; display:flex; flex-direction:column; }
    .hh-phone-notch { width:120px; height:16px; background:#0a0e16; border-radius:0 0 10px 10px; margin:-14px auto 8px; }
    .hh-phone-screen { flex:1; min-height:0; border-radius:16px; overflow:hidden; background: linear-gradient(160deg,#ff8a5b 0%,#6b2cff 50%,#1b3b6f 100%); position:relative; display:flex; flex-direction:column; }
    .hh-phone-home { padding:8px 12px 12px; display:flex; flex-direction:column; gap:10px; height:100%; overflow:auto; }
    .hh-phone-status { display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:800; padding:0 2px; opacity:0.95; }
    .hh-phone-clock { text-align:center; margin-top:6px; }
    .hh-phone-clock .time { font-size:42px; font-weight:900; line-height:1; letter-spacing:1px; }
    .hh-phone-clock .date { font-size:12px; font-weight:700; color:#f3e7ff; margin-top:2px; text-transform:uppercase; letter-spacing:1px; }
    .hh-phone-notif { background:rgba(10,14,22,0.55); backdrop-filter: blur(4px); border-radius:12px; padding:10px 12px; border-left:3px solid #ffcc4d; font-size:12px; }
    .hh-phone-notif .from { font-size:10px; text-transform:uppercase; letter-spacing:1.2px; color:#ffcc4d; font-weight:900; }
    .hh-phone-notif .msg { margin-top:3px; color:#fff; font-weight:700; line-height:1.3; }
    .hh-app-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; align-content:start; margin-top:auto; }
    .hh-app { background:rgba(0,0,0,0.25); border-radius:14px; padding:10px 6px; text-align:center; cursor:pointer; font-size:11px; font-weight:800; backdrop-filter: blur(2px); }
    .hh-app-icon { font-size:22px; margin-bottom:4px; }
    .hh-phone-appview { position:absolute; inset:0; background:rgba(10,14,22,0.96); display:flex; flex-direction:column; }
    .hh-phone-appbar { padding:10px 12px; background:rgba(255,255,255,0.06); display:flex; align-items:center; gap:8px; font-weight:900; }
    .hh-back { cursor:pointer; color:#5cc8ff; font-weight:900; }
    .hh-phone-body { flex:1; overflow:auto; padding:10px; }
    .hh-contact, .hh-thread-item, .hh-job, .hh-garage-item { padding:10px; background:rgba(255,255,255,0.05); border-radius:8px; margin-bottom:8px; }
    .hh-contact { display:flex; justify-content:space-between; align-items:center; cursor:pointer; }
    .hh-call-btn { color:#3ee6b0; font-weight:900; }
    .hh-msg { margin-bottom:8px; max-width:85%; }
    .hh-msg .from { font-size:10px; color:#5cc8ff; text-transform:uppercase; letter-spacing:1px; }
    .hh-msg .bubble { background:rgba(255,255,255,0.08); padding:8px 10px; border-radius:10px; margin-top:2px; font-size:13px; font-weight:600; }
    .hh-msg.me { margin-left:auto; } .hh-msg.me .bubble { background:rgba(255,107,90,0.25); }

    .hh-full-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; flex-direction:column; pointer-events:auto; }
    .hh-wasted { background: rgba(60,0,0,0.45); }
    .hh-busted { background: rgba(0,20,60,0.45); }
    .hh-slanted { font-size:96px; font-weight:900; letter-spacing:4px; transform: skewX(-10deg) rotate(-4deg); text-shadow:0 6px 0 rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.5); }
    .hh-wasted .hh-slanted { color:#ff3b3b; } .hh-busted .hh-slanted { color:#5cc8ff; }
    .hh-fee { font-size:22px; margin-top:8px; font-weight:900; color:#fff; }
    .hh-sub { font-size:14px; color:#e8eef7; margin-top:4px; letter-spacing:1px; text-transform:uppercase; }
    .hh-overlay-actions { margin-top:18px; display:flex; gap:10px; }
    .hh-action-btn { padding:10px 18px; border-radius:8px; border:none; font-weight:900; cursor:pointer; text-transform:uppercase; letter-spacing:1px; }
    .hh-action-primary { background:#ff6b5a; color:#fff; } .hh-action-secondary { background:rgba(255,255,255,0.15); color:#fff; }

    .hh-mission-passed { position:absolute; left:50%; top:18%; transform:translateX(-50%); text-align:center; }
    .hh-passed-banner { background: linear-gradient(90deg, rgba(14,18,32,0.0), rgba(14,18,32,0.85), rgba(14,18,32,0.0)); padding:18px 40px; border-top:2px solid #ffcc4d; border-bottom:2px solid #ffcc4d; }
    .hh-passed-title { font-size:40px; font-weight:900; color:#ffcc4d; letter-spacing:3px; }
    .hh-passed-rewards { font-size:22px; font-weight:900; margin-top:6px; color:#3ee6b0; }

    .hh-controls-card { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:520px; max-width:calc(100vw - 40px); background:rgba(14,18,32,0.92); border-radius:12px; padding:18px; border:1px solid rgba(255,255,255,0.12); }
    .hh-controls-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 16px; margin-top:10px; }
    .hh-control-row { display:flex; justify-content:space-between; font-size:14px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
    .hh-keycap { background:#ffcc4d; color:#111; padding:2px 8px; border-radius:4px; font-weight:900; font-size:12px; }
    .hh-close-x { position:absolute; right:12px; top:8px; cursor:pointer; font-size:20px; color:#aab6c5; }
    .hh-hidden { display:none !important; }
  `;
  document.head.appendChild(style);
}
