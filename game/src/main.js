// Entry point: wires core systems, world, actors, vehicles, police, combat, HUD, and game flow.
import { createState } from './core/state.js';
import { createClock } from './core/clock.js';
import { createApp } from './core/app.js';
import { createInput } from './core/input.js';
import { createCity } from './world/city.js';
import { createPlayer } from './actors/player.js';
import { updateCamera } from './core/camera.js';
import { parkCars, updateCar } from './vehicles/car.js';
import { tryToggleVehicle, findNearestCar, updateVehicleActions, updateFleeingDrivers } from './vehicles/interaction.js';
import { createHudSystem } from './ui/hud/hudRoot.js';
import { createTraffic } from './traffic/traffic.js';
import { createPedestrians } from './actors/pedestrians.js';
import { createEffects } from './fx/effects.js';
import { createPoliceSystem } from './police/dispatch.js';
import { createCombatSystem } from './combat/weapons.js';
import { setupShots } from './shots/shotDirector.js';
import { buildMapData } from './world/mapData.js';
import { setupAutotest } from './shots/autotest.js';
import { createGameFlow } from './flow/gameFlow.js';

function main() {
  const params = new URLSearchParams(window.location.search);
  const shotName = params.get('shot');
  const autotestMode = params.get('autotest') === '1';
  const seed = parseInt(params.get('seed') || '1', 10) || 1;
  const shotOrAuto = !!(shotName || autotestMode);
  const app = createApp(document.getElementById('app'));
  const state = createState(seed);
  const clock = createClock();
  const input = createInput(window);
  const hud = createHudSystem(document.getElementById('hud'));

  const city = createCity(app.scene, state);
  const mapData = buildMapData(state.world.layout);
  hud.setMapData(mapData);
  state.cars = parkCars(app.scene, state.world.layout, 45, state.rng);
  state.effects = createEffects(app.scene);
  state.traffic = createTraffic(app.scene, state, 30);
  state.pedestrians = createPedestrians(app.scene, state, 36);
  state.combat = createCombatSystem(state);
  state.police = createPoliceSystem(app.scene, state);
  const player = createPlayer(app.scene, state);

  let shotCtrl = null;
  let autoCtrl = null;
  let flow = null;

  if (shotName) {
    shotCtrl = setupShots(shotName, { app, state, city, player, hud, seed, input });
  }
  if (autotestMode) {
    state.mode = 'play';
    shotCtrl = null;
    autoCtrl = setupAutotest({ app, state, city, player, hud, input, seed });
  }
  if (!shotOrAuto) {
    flow = createGameFlow({
      state, hud, input,
      scene: app.scene, camera: app.camera, renderer: app.renderer,
      player, cars: state.cars, city, mapData,
    });
  }

  // test hook for headless verification
  if (!shotOrAuto && params.get('test') === 'newgame') {
    window.__hh = { state, flow };
    setTimeout(() => {
      try {
        const btn = document.querySelector('.hh-menu-btn[data-action="new"]');
        if (btn) btn.click();
      } catch (e) {}
    }, 1200);
    setTimeout(() => {
      try {
        const mission = state.mission || {};
        const dlg = state.dialogue || {};
        const target = state.minimap && state.minimap.target;
        const info = { ok: !!(mission.title && dlg.visible), title: mission.title || '', stage: mission.stage || 0, objective: mission.objective || '', speaker: dlg.speaker || '', dialogue: dlg.text || '', hasMarker: !!(target && target.x != null), mode: state.mode };
        document.title = 'NEWGAME ' + JSON.stringify(info);
        console.log('NEWGAME_RESULT', JSON.stringify(info));
      } catch (e) { console.log('NEWGAME_ERROR', String(e)); }
    }, 2600);
  }

  function syncHud(prompt) {
    if (prompt !== undefined) state.interact = prompt || null;
    if (state.player.inCar && state.car) {
      state.speed = Math.abs(state.car.speed);
      state.car.condition = Math.max(0, Math.round(100 - (state.car.damage || 0) * 100));
    } else {
      state.speed = state.player.speed || 0;
    }
    if (!state.radio) state.radio = { station: 'WAVE 101.7', genre: 'Coastline Pop', track: 'Sunset Run', visible: true };
    if (!state.mission) state.mission = { number: 1, act: 'ACT I', title: 'Harbor Heat', stage: 1, stageTotal: 1, objective: state.hud && state.hud.objective ? state.hud.objective : 'Explore Port Solenne' };
    hud.update(state);
  }

  function respawnPlayer(label) {
    if (state.respawn.state) return;
    state.respawn = { state: label.toLowerCase(), timer: 3.0, label };
  }

  function doRespawn() {
    const p = state.player;
    if (p.inCar && state.car) { state.car.driver = null; p.inCar = null; state.car = null; }
    p.health = 100; p.armour = 0; p.wanted = 0; p.dead = false; p.busted = false; p.action = null; p.actionTime = 0;
    p.x = 0; p.z = state.world.layout.depth / 2 - 35; p.y = 0; p.vy = 0; p.onGround = true; p.speed = 0; p.yaw = Math.PI;
    if (state.police) {
      if (state.police.heat && state.police.heat.heat) { state.police.heat.heat.value = 0; state.police.heat.heat.stars = 0; state.police.heat.heat.search = 0; state.police.heat.heat.lastCrime = 0; }
      if (state.police.clearUnits) state.police.clearUnits();
    }
    state.dispatch = { visible: false, stars: 0, units: [], more: 0 };
    state.wanted = { searching: false, status: '' };
    if (state.hud) state.hud.objective = 'Respawned in Marigold Beach. Stay out of trouble.';
    state.respawn = { state: null, timer: 0, label: '' };
  }

  function checkWastedBusted() {
    if (state.respawn.state || state.mode !== 'play') return;
    if (state.player.health <= 0) { respawnPlayer('WASTED'); return; }
    if (state.player.wanted > 0 && !state.player.inCar && state.police && state.police.units) {
      for (const c of state.police.units.cars) {
        if (!c || c.dead || !c.mesh) continue;
        const dx = c.mesh.position.x - state.player.x;
        const dz = c.mesh.position.z - state.player.z;
        const d2 = dx * dx + dz * dz;
        if (d2 < 25 && Math.abs(c.speed || 0) < 2.5) { respawnPlayer('BUSTED'); return; }
      }
    }
  }

  function simulate(dt) {
    state.time += dt;
    input.update();
    if (flow) flow.update(dt);

    if (flow && !flow.isPlaying()) {
      if (state.traffic) state.traffic.update(dt, state);
      if (state.pedestrians) state.pedestrians.update(dt, state);
      if (state.effects) state.effects.update(dt);
      city.update(dt, state);
      syncHud(null);
      return;
    }

    if (state.respawn.state) {
      state.respawn.timer -= dt;
      if (state.hud) state.hud.objective = state.respawn.label + ' - Respawning...';
      if (state.respawn.timer <= 0) doRespawn();
      if (state.traffic) state.traffic.update(dt, state);
      if (state.pedestrians) state.pedestrians.update(dt, state);
      if (state.effects) state.effects.update(dt);
      if (state.police) state.police.update(dt, state);
      city.update(dt, state);
      updateCamera(app, state, dt);
      syncHud(null);
      return;
    }

    const enter = input.consumeEnter();
    if (flow) flow.handleEnter(enter);
    if (enter) tryToggleVehicle(state);
    updateVehicleActions(dt, state, app.scene);
    updateFleeingDrivers(dt, state, app.scene);

    if (state.player.inCar && state.car) {
      const car = state.car;
      if (car.dead) {
        car.driver = null;
        state.player.inCar = null;
        state.car = null;
      } else {
        const ctl = { throttle: input.state.forward, steer: -input.state.right, brake: false, handbrake: input.state.jump };
        if (input.state.forward < 0 && car.speed > 0.6) ctl.throttle = -0.7;
        if (input.state.forward > 0 && car.speed < -0.6) ctl.brake = true;
        updateCar(car, dt, ctl, state.colliders, state.world.bounds, state);
      }
    } else {
      player.update(dt, input, state.camera.yaw - Math.PI);
    }

    if (state.traffic) state.traffic.update(dt, state);
    if (state.pedestrians) state.pedestrians.update(dt, state);
    if (state.combat) state.combat.update(dt, state, app.scene, input);
    if (state.police) state.police.update(dt, state);
    if (state.effects) state.effects.update(dt);
    city.update(dt, state);
    checkWastedBusted();
    updateCamera(app, state, dt);

    let prompt = null;
    if (!state.player.inCar && !state.player.action) {
      const near = findNearestCar(state, 3.2);
      if (near) prompt = 'Press F to ' + (near.driver && near.driver !== 'player' ? 'steal ' : 'enter ') + near.name;
    } else if (state.player.action === 'steal') {
      prompt = 'Pulling driver out...';
    }
    syncHud(prompt);
  }

  function renderFrame(nowMs) {
    requestAnimationFrame(renderFrame);
    const now = nowMs / 1000;
    if (shotCtrl) { shotCtrl.frame(now); return; }
    const t = clock.tick(now);
    if (autoCtrl) autoCtrl(now, clock.step);
    for (let i = 0; i < t.steps; i++) simulate(clock.step);
    app.renderer.render(app.scene, app.camera);
  }

  requestAnimationFrame(renderFrame);
}

main();
