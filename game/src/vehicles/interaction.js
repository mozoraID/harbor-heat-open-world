// Handles entering, exiting, and stealing vehicles including pulling drivers out.
import { dist2 } from '../core/math.js';
import { createPedestrianModel } from '../actors/pedestrianModel.js';

export function findNearestCar(state, maxDist = 3.2) {
  const p = state.player;
  let best = null, bestD = maxDist * maxDist;
  const pools = [state.cars || []];
  if (state.traffic && state.traffic.cars) pools.push(state.traffic.cars);
  for (const list of pools) {
    for (const car of list) {
      if (!car || !car.mesh) continue;
      const d = dist2(p.x, p.z, car.mesh.position.x, car.mesh.position.z);
      if (d < bestD) { bestD = d; best = car; }
    }
  }
  return best;
}

export function tryToggleVehicle(state) {
  const p = state.player;
  if (p.action === 'steal') return false;
  if (p.inCar) {
    const car = p.inCar;
    p.x = car.mesh.position.x + Math.cos(car.yaw) * 2.1;
    p.z = car.mesh.position.z - Math.sin(car.yaw) * 2.1;
    p.y = 0;
    p.inCar = null;
    car.driver = null;
    state.car = null;
    state.hud.objective = 'On foot in ' + state.districtName + '. Find another ride.';
    return true;
  }
  const car = findNearestCar(state);
  if (!car || car.dead) return false;
  if (car.driver && car.driver !== 'player') {
    p.action = 'steal';
    p.actionTime = 0.8;
    p.actionTarget = car;
    car.speed = 0;
    state.hud.objective = 'Pulling driver out of ' + car.name + '...';
    return true;
  }
  p.inCar = car;
  car.driver = 'player';
  state.car = car;
  state.hud.objective = 'Driving ' + car.name + '. Press F to exit.';
  return true;
}

export function updateVehicleActions(dt, state, scene) {
  const p = state.player;
  if (p.action === 'steal') {
    p.actionTime -= dt;
    if (p.actionTime <= 0) {
      const car = p.actionTarget;
      if (car) {
        spawnFleeingDriver(scene, state, car);
        car.driver = 'player';
        p.inCar = car;
        state.car = car;
        state.player.wanted = Math.min(5, Math.max(1, state.player.wanted));
        state.hud.objective = 'Stole ' + car.name + '. Drive!';
      }
      p.action = null; p.actionTarget = null;
    }
  }
}

function spawnFleeingDriver(scene, state, car) {
  if (!state._fleeing) state._fleeing = [];
  const m = createPedestrianModel(state.rng);
  m.position.set(car.mesh.position.x + 2.2, 0.15, car.mesh.position.z);
  scene.add(m);
  state._fleeing.push({ model: m, x: m.position.x, z: m.position.z, dir: car.yaw + Math.PI / 2, t: 4 });
}

export function updateFleeingDrivers(dt, state, scene) {
  if (!state._fleeing) return;
  for (let i = state._fleeing.length - 1; i >= 0; i--) {
    const f = state._fleeing[i];
    f.t -= dt;
    f.x += Math.sin(f.dir) * 4.5 * dt;
    f.z += Math.cos(f.dir) * 4.5 * dt;
    f.model.position.set(f.x, 0.15, f.z);
    f.model.rotation.y = f.dir;
    if (f.t <= 0) { scene.remove(f.model); state._fleeing.splice(i, 1); }
  }
}
