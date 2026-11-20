// Handles entering, exiting, and stealing nearby vehicles.
import { dist2 } from '../core/math.js';

export function findNearestCar(state, maxDist = 3.2) {
  const p = state.player;
  let best = null;
  let bestD = maxDist * maxDist;
  for (const car of state.cars) {
    const d = dist2(p.x, p.z, car.mesh.position.x, car.mesh.position.z);
    if (d < bestD) { bestD = d; best = car; }
  }
  return best;
}

export function tryToggleVehicle(state) {
  const p = state.player;
  if (p.inCar) {
    // exit
    const car = p.inCar;
    const side = 2.0;
    p.x = car.mesh.position.x + Math.cos(car.yaw) * side;
    p.z = car.mesh.position.z - Math.sin(car.yaw) * side;
    p.y = 0;
    p.inCar = null;
    car.driver = null;
    state.car = null;
    state.hud.objective = 'On foot in ' + state.districtName + '. Find another ride.';
    return true;
  } else {
    const car = findNearestCar(state);
    if (car) {
      p.inCar = car;
      car.driver = 'player';
      state.car = car;
      state.hud.objective = 'Driving ' + car.name + '. Press F to exit.';
      return true;
    }
  }
  return false;
}
