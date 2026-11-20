// Entry point: wires core systems, world, actors, vehicles, HUD, and the game loop.
import { createState } from './core/state.js';
import { createClock } from './core/clock.js';
import { createApp } from './core/app.js';
import { createInput } from './core/input.js';
import { createCity } from './world/city.js';
import { createPlayer } from './actors/player.js';
import { updateCamera } from './core/camera.js';
import { parkCars, updateCar } from './vehicles/car.js';
import { tryToggleVehicle, findNearestCar } from './vehicles/interaction.js';
import { createHud } from './ui/hud.js';
import { setupShots } from './shots/shotDirector.js';

function main() {
  const params = new URLSearchParams(window.location.search);
  const shotName = params.get('shot');
  const seed = parseInt(params.get('seed') || '1', 10) || 1;
  const container = document.getElementById('app');
  const hudRoot = document.getElementById('hud');
  const app = createApp(container);
  const state = createState(seed);
  const clock = createClock();
  const input = createInput(window);
  const hud = createHud(hudRoot);

  const city = createCity(app.scene, state);
  state.cars = parkCars(app.scene, state.world.layout, 40, state.rng);
  const player = createPlayer(app.scene, state);

  let shotCtrl = null;
  if (shotName) {
    shotCtrl = setupShots(shotName, { app, state, city, player, hud, seed });
  } else {
    state.mode = 'play';
  }

  function simulate(dt) {
    input.update();
    if (input.consumeEnter()) tryToggleVehicle(state);
    if (state.player.inCar && state.car) {
      const car = state.car;
      const ctl = { throttle: input.state.forward, steer: -input.state.right, brake: false, handbrake: input.state.jump };
      if (input.state.forward < 0 && car.speed > 0.6) ctl.throttle = -0.7;
      if (input.state.forward > 0 && car.speed < -0.6) ctl.throttle = 0.7;
      updateCar(car, dt, ctl, state.colliders, state.world.bounds);
    } else {
      player.update(dt, input, state.camera.yaw - Math.PI);
    }
    city.update(dt, state);
    updateCamera(app, state, dt);
    let prompt = null;
    if (!state.player.inCar) {
      const near = findNearestCar(state, 3.2);
      if (near) prompt = 'Press F to enter ' + near.name;
    }
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
