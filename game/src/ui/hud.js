// Renders the in-game HUD overlay with mission, minimap, status bars, and prompts.
export function createHud(root) {
  root.innerHTML = `
    <div id="hud-wrap" style="position:fixed;inset:0;pointer-events:none;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#fff;">
      <div id="hud-top-left" style="position:absolute;left:18px;top:16px;max-width:420px;background:rgba(10,14,20,0.55);backdrop-filter:blur(4px);padding:12px 14px;border-left:4px solid #ffbf47;border-radius:6px;">
        <div style="font-size:11px;letter-spacing:1.6px;color:#ffd27d;text-transform:uppercase;">Mission</div>
        <div id="hud-mission" style="font-size:18px;font-weight:700;margin-top:2px;">Harbor Heat</div>
        <div id="hud-objective" style="font-size:13px;color:#e6edf3;margin-top:4px;line-height:1.35;">Objective</div>
      </div>
      <div id="hud-top-right" style="position:absolute;right:18px;top:16px;text-align:right;background:rgba(10,14,20,0.55);backdrop-filter:blur(4px);padding:10px 14px;border-radius:6px;min-width:180px;">
        <div style="font-size:11px;letter-spacing:1.4px;color:#ffd27d;text-transform:uppercase;">Port Solenne</div>
        <div id="hud-money" style="font-size:22px;font-weight:700;color:#7dff9e;">S$ 240</div>
        <div id="hud-time" style="font-size:13px;color:#e6edf3;">18:42 Golden Hour</div>
        <div id="hud-stars" style="font-size:16px;margin-top:2px;color:#889;">☆ ☆ ☆ ☆ ☆</div>
      </div>
      <div id="hud-bottom-left" style="position:absolute;left:18px;bottom:18px;display:flex;gap:12px;align-items:flex-end;">
        <canvas id="hud-minimap" width="180" height="180" style="width:180px;height:180px;border-radius:50%;background:rgba(8,12,18,0.75);border:2px solid rgba(255,255,255,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.4);"></canvas>
        <div style="background:rgba(10,14,20,0.55);backdrop-filter:blur(4px);padding:10px 12px;border-radius:6px;min-width:170px;">
          <div style="font-size:11px;color:#ffd27d;letter-spacing:1.2px;text-transform:uppercase;">Status</div>
          <div style="margin-top:6px;font-size:12px;">Health</div>
          <div style="height:8px;background:#333;border-radius:4px;overflow:hidden;margin-top:2px;"><div id="hud-health" style="height:100%;width:100%;background:linear-gradient(90deg,#3ddc84,#7dff9e);"></div></div>
          <div id="hud-district" style="font-size:13px;color:#e6edf3;margin-top:8px;">Marigold Beach</div>
          <div id="hud-mode" style="font-size:12px;color:#9fb3c8;">On Foot</div>
        </div>
      </div>
      <div id="hud-bottom-right" style="position:absolute;right:18px;bottom:18px;background:rgba(10,14,20,0.55);backdrop-filter:blur(4px);padding:10px 14px;border-radius:6px;min-width:220px;text-align:right;">
        <div id="hud-speed" style="font-size:28px;font-weight:700;">0 km/h</div>
        <div id="hud-car" style="font-size:13px;color:#d8e1ea;">On Foot</div>
        <div style="margin-top:6px;font-size:12px;color:#9fb3c8;">WASD move · Mouse look · Shift sprint · Space jump/handbrake · F enter/exit car</div>
      </div>
      <div id="hud-center" style="position:absolute;left:50%;top:12%;transform:translateX(-50%);text-align:center;">
        <div id="hud-banner" style="display:inline-block;padding:8px 16px;background:rgba(10,14,20,0.45);border-radius:20px;font-size:14px;letter-spacing:1px;color:#fff;">Port Solenne</div>
      </div>
      <div id="hud-prompt" style="position:absolute;left:50%;bottom:28%;transform:translateX(-50%);padding:8px 14px;background:rgba(10,14,20,0.7);border:1px solid rgba(255,255,255,0.2);border-radius:6px;font-size:14px;display:none;">Press F to enter vehicle</div>
      <div id="hud-toast" style="position:absolute;left:50%;top:22%;transform:translateX(-50%);padding:8px 14px;background:rgba(20,20,20,0.7);border-radius:6px;font-size:14px;opacity:0;transition:opacity 0.3s;"> </div>
    </div>
  `;

  const els = {
    mission: root.querySelector('#hud-mission'),
    objective: root.querySelector('#hud-objective'),
    money: root.querySelector('#hud-money'),
    time: root.querySelector('#hud-time'),
    stars: root.querySelector('#hud-stars'),
    health: root.querySelector('#hud-health'),
    district: root.querySelector('#hud-district'),
    mode: root.querySelector('#hud-mode'),
    speed: root.querySelector('#hud-speed'),
    car: root.querySelector('#hud-car'),
    banner: root.querySelector('#hud-banner'),
    prompt: root.querySelector('#hud-prompt'),
    minimap: root.querySelector('#hud-minimap'),
  };
  const mm = els.minimap.getContext('2d');

  function update(state, extra = {}) {
    if (els.mission) els.mission.textContent = state.hud.mission || 'Harbor Heat';
    if (els.objective) els.objective.textContent = state.hud.objective || '';
    if (els.money) els.money.textContent = 'S$ ' + Math.floor(state.player.money);
    if (els.time) els.time.textContent = extra.timeLabel || '18:42 Golden Hour';
    if (els.health) els.health.style.width = Math.max(0, state.player.health) + '%';
    if (els.district) els.district.textContent = state.districtName || 'Port Solenne';
    if (els.banner) els.banner.textContent = state.districtName || 'Port Solenne';
    const inCar = !!state.player.inCar;
    if (els.mode) els.mode.textContent = inCar ? 'In Vehicle' : 'On Foot';
    const speed = inCar && state.car ? Math.abs(state.car.speed) * 3.6 : state.player.speed * 3.6;
    if (els.speed) els.speed.textContent = Math.round(speed) + ' km/h';
    if (els.car) els.car.textContent = inCar && state.car ? state.car.name : 'On Foot';
    if (els.prompt) {
      els.prompt.style.display = extra.prompt ? 'block' : 'none';
      if (extra.prompt) els.prompt.textContent = extra.prompt;
    }
    drawMinimap(mm, state);
  }

  function drawMinimap(ctx, state) {
    const w = 180, h = 180, r = 85;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#1a2230'; ctx.fillRect(-r, -r, w, h);
    const layout = state.world.layout;
    if (layout) {
      const scale = 0.22;
      const px = state.player.x, pz = state.player.z;
      const yaw = state.player.inCar && state.car ? state.car.yaw : (state.camera?.yaw ? state.camera.yaw - Math.PI : 0);
      ctx.rotate(-yaw);
      // roads grid
      ctx.strokeStyle = '#49586b'; ctx.lineWidth = 3;
      for (const b of layout.blocks) {
        const dx = (b.x - px) * scale;
        const dz = (b.z - pz) * scale;
        ctx.strokeRect(dx - b.size * scale / 2, dz - b.size * scale / 2, b.size * scale, b.size * scale);
      }
      // cars
      ctx.fillStyle = '#7ec8e3';
      for (const car of state.cars) {
        if (car === state.car) continue;
        const dx = (car.mesh.position.x - px) * scale;
        const dz = (car.mesh.position.z - pz) * scale;
        if (dx*dx+dz*dz < r*r) ctx.fillRect(dx - 2, dz - 2, 4, 4);
      }
      // player
      ctx.rotate(yaw); // back to screen space for player marker
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(5, 6); ctx.lineTo(0, 3); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r - 1, 0, Math.PI * 2); ctx.stroke();
    // N marker
    ctx.fillStyle = '#ffd27d'; ctx.font = 'bold 11px system-ui'; ctx.fillText('N', -4, -r + 14);
    ctx.restore();
  }

  return { update, els };
}
