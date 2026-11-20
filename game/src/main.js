// Entry point: wires core systems, world, actors, vehicles, police, combat, and HUD.
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

function main() {
  const params = new URLSearchParams(window.location.search);
  const shotName = params.get('shot');
  const seed = parseInt(params.get('seed') || '1', 10) || 1;
  const app = createApp(document.getElementById('app'));
  const state = createState(seed);
  const clock = createClock();
  const input = createInput(window);
  const hud = createHudSystem(document.getElementById('hud'));

  const city = createCity(app.scene, state);
  hud.setMapData(buildMapData(state.world.layout));
  state.cars = parkCars(app.scene, state.world.layout, 45, state.rng);
  state.effects = createEffects(app.scene);
  state.traffic = createTraffic(app.scene, state, 30);
  state.pedestrians = createPedestrians(app.scene, state, 36);
  state.combat = createCombatSystem(state);
  state.police = createPoliceSystem(app.scene, state);
  const player = createPlayer(app.scene, state);

  let shotCtrl = null;
  if (shotName) {
    shotCtrl = setupShots(shotName, { app, state, city, player, hud, seed });
  } else {
    state.mode = 'play';
  }

  function syncHud(prompt) {
    state.interact = prompt || null;
    if (state.player.inCar && state.car) {
      state.speed = Math.abs(state.car.speed);
      state.car.condition = Math.max(0, Math.round(100 - (state.car.damage || 0) * 100));
    } else {
      state.speed = state.player.speed || 0;
    }
    if (!state.radio) state.radio = { station: 'WAVE 101.7', genre: 'Coastline Pop', track: 'Sunset Run', visible: true };
    if (!state.mission) state.mission = { number: 1, act: 'ACT I', title: 'Harbor Heat', stage: 1, stageTotal: 1, objective: state.hud.objective };
    hud.update(state);
  }

  function respawnPlayer(label) {
    if (state.respawn.timer > 0) return;
    state.respawn = { state: 'respawning', timer: 2.5, label: label || 'WASTED' };
  }

  function doRespawn() {
    const p = state.player;
    if (p.inCar && state.car) { state.car.driver = null; state.car = null; p.inCar = null; }
    p.health = 100; p.armour = 0; p.dead = false; p.busted = false; p.action = null;
    p.x = 0; p.z = state.world.layout.depth / 2 - 35; p.y = 0; p.vy = 0; p.yaw = Math.PI;
    p.wanted = 0;
    if (state.police && state.police.clearUnits) state.police.clearUnits();
    if (state.police && state.police.heat) { state.police.heat.heat.value = 0; state.police.heat.heat.stars = 0; state.police.heat.heat.search = 0; }
    state.dispatch = { visible: false, stars: 0, units: [] };
    state.wanted = { searching: false, status: '' };
    state.respawn = { state: null, timer: 0, label: '' };
    state.hud.objective = 'Back on the streets of Marigold Beach.';
  }

  function simulate(dt) {
    state.time += dt;
    if (state.respawn.timer > 0) {
      state.respawn.timer -= dt;
      state.interact = state.respawn.label;
      if (state.respawn.timer <= 0) doRespawn();
      syncHud(state.respawn.label);
      city.update(dt, state);
      updateCamera(app, state, dt);
      return;
    }
    input.update();
    const slot = input.consumeWeaponSlot();
    if (slot && state.weapons) { state.player.activeWeapon = slot; state.activeWeapon = slot; }
    if (input.consumeEnter()) tryToggleVehicle(state);
    updateVehicleActions(dt, state, app.scene);
    updateFleeingDrivers(dt, state, app.scene);
    if (state.player.inCar && state.car) {
      const car = state.car;
      if (car.dead) { try { state.car.driver = null; state.player.inCar = null; state.car = null; } catch(e){} }
      else {
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
    if (state.police) state.police.update(dt, state);
    if (state.combat) state.combat.update(dt, state, app.scene, input);
    if (state.effects) state.effects.update(dt);
    // wasted/busted checks
    if (state.player.health <= 0) { state.player.dead = true; respawnPlayer('WASTED'); }
    if (!state.player.dead && state.player.wanted >= 1 && !state.player.inCar && state.police) {
      const nearCop = (state.police.units.cars || []).some(c => { const dx=c.mesh.position.x-state.player.x, dz=c.mesh.position.z-state.player.z; return dx*dx+dz*dz < 36 && Math.abs(c.speed||0) < 1.5; });
      if (nearCop) respawnPlayer('BUSTED');
    }
    city.update(dt, state);
    updateCamera(app, state, dt);
    let prompt = null;
    if (!state.player.inCar && !state.player.action) {
      const near = findNearestCar(state, 3.2);
      if (near) prompt = 'Press F to ' + (near.driver && near.driver !== 'player' ? 'steal ' : 'enter ') + near.name;
    } else if (state.player.action === 'steal') prompt = 'Pulling driver out...';
    syncHud(prompt);
  }

  function renderFrame(nowMs) {
    requestAnimationFrame(renderFrame);
    const now = nowMs / 1000;
    if (shotCtrl) { shotCtrl.frame(now); return; }
    const t = clock.tick(now);
    for (let i = 0; i < t.steps; i++) simulate(clock.step);
    app.renderer.render(app.scene, app.camera);
  }

  requestAnimationFrame(renderFrame);
}

main();
