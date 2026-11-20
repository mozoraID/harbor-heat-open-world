// Entry point: wires core systems, world, actors, vehicles, traffic, and HUD.
import { createState } from './core/state.js';
import { createClock } from './core/clock.js';
import { createApp } from './core/app.js';
import { createInput } from './core/input.js';
import { createCity } from './world/city.js';
import { createPlayer } from './actors/player.js';
import { updateCamera } from './core/camera.js';
import { parkCars, updateCar } from './vehicles/car.js';
import { tryToggleVehicle, findNearestCar, updateVehicleActions, updateFleeingDrivers } from './vehicles/interaction.js';
import { createHud } from './ui/hud.js';
import { createTraffic } from './traffic/traffic.js';
import { createPedestrians } from './actors/pedestrians.js';
import { createEffects } from './fx/effects.js';
import { setupShots } from './shots/shotDirector.js';

function main() {
  const params = new URLSearchParams(window.location.search);
  const shotName = params.get('shot');
  const seed = parseInt(params.get('seed') || '1', 10) || 1;
  const app = createApp(document.getElementById('app'));
  const state = createState(seed);
  const clock = createClock();
  const input = createInput(window);
  const hud = createHud(document.getElementById('hud'));

  const city = createCity(app.scene, state);
  state.cars = parkCars(app.scene, state.world.layout, 45, state.rng);
  state.effects = createEffects(app.scene);
  state.traffic = createTraffic(app.scene, state, 30);
  state.pedestrians = createPedestrians(app.scene, state, 36);
  const player = createPlayer(app.scene, state);

  let shotCtrl = null;
  if (shotName) {
    shotCtrl = setupShots(shotName, { app, state, city, player, hud, seed });
  } else {
    state.mode = 'play';
  }

  function simulate(dt) {
    state.time += dt;
    input.update();
    if (input.consumeEnter()) tryToggleVehicle(state);
    updateVehicleActions(dt, state, app.scene);
    updateFleeingDrivers(dt, state, app.scene);
    if (state.player.inCar && state.car) {
      const car = state.car;
      const ctl = { throttle: input.state.forward, steer: -input.state.right, brake: false, handbrake: input.state.jump };
      if (input.state.forward < 0 && car.speed > 0.6) ctl.throttle = -0.7;
      if (input.state.forward > 0 && car.speed < -0.6) ctl.brake = true;
      updateCar(car, dt, ctl, state.colliders, state.world.bounds, state);
    } else {
      player.update(dt, input, state.camera.yaw - Math.PI);
    }
    if (state.traffic) state.traffic.update(dt, state);
    if (state.pedestrians) state.pedestrians.update(dt, state);
    if (state.effects) state.effects.update(dt);
    city.update(dt, state);
    updateCamera(app, state, dt);
    let prompt = null;
    if (!state.player.inCar && !state.player.action) {
      const near = findNearestCar(state, 3.2);
      if (near) prompt = 'Press F to ' + (near.driver && near.driver !== 'player' ? 'steal ' : 'enter ') + near.name;
    } else if (state.player.action === 'steal') prompt = 'Pulling driver out...';
    hud.update(state, { prompt, timeLabel: '18:42 Golden Hour' });
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
