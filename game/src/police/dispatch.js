// Spawns and manages SHP police units based on wanted level and updates HUD dispatch info.
import * as THREE from 'three';
import { createHeat } from './heat.js';
import { createPoliceCar } from './policeCar.js';
import { createRoadblock } from './roadblock.js';
import { createHelicopter } from './helicopter.js';

export function createPoliceSystem(scene, state) {
  const heat = createHeat();
  const units = { cars: [], roadblocks: [], heli: null, foot: [] };
  let counters = { gull: 1, marlin: 1, bulwark: 1 };

  function spawnPatrol() {
    const name = `GULL-${String(counters.gull++).padStart(2, '0')}`;
    const car = createPoliceCar(scene, state, { callSign: name, type: 'cruiser' });
    units.cars.push(car);
  }
  function spawnInterceptor() {
    const name = `MARLIN-${counters.marlin++}`;
    const car = createPoliceCar(scene, state, { callSign: name, type: 'interceptor' });
    units.cars.push(car);
  }
  function ensureRoadblock() {
    if (units.roadblocks.length) return;
    units.roadblocks.push(createRoadblock(scene, state, `BULWARK-${counters.bulwark++}`));
  }
  function ensureHeli() {
    if (units.heli) return;
    units.heli = createHelicopter(scene, state, 'HERON-1');
  }

  function syncStars(stars) {
    const wantCruisers = Math.min(stars, 4);
    const wantInterceptors = stars >= 2 ? Math.min(stars - 1, 3) : 0;
    while (units.cars.filter(c => c.variant === 'cruiser').length < wantCruisers) spawnPatrol();
    while (units.cars.filter(c => c.variant === 'interceptor').length < wantInterceptors) spawnInterceptor();
    if (stars >= 3) ensureRoadblock();
    if (stars >= 4) ensureHeli();
  }

  function clearUnits() {
    if (units.heli) { units.heli.remove(scene); units.heli = null; }
    for (const rb of units.roadblocks) rb.remove(scene);
    units.roadblocks.length = 0;
    for (const car of units.cars) { if (car.mesh && car.mesh.parent) scene.remove(car.mesh); }
    units.cars.length = 0;
  }

  function cleanup(stars) {
    if (stars < 4 && units.heli) { units.heli.remove(scene); units.heli = null; }
    if (stars < 3) { for (const rb of units.roadblocks) rb.remove(scene); units.roadblocks.length = 0; }
  }

  function update(dt, state) {
    if (state.mode !== 'play') return;
    const now = state.time;
    const canSee = units.cars.some(c => c.hasSight);
    const h = heat.update(dt, now, canSee);
    state.player.wanted = h.stars;
    if (h.stars > 0) { syncStars(h.stars); cleanup(h.stars); }
    else if (units.cars.length || units.heli || units.roadblocks.length) { clearUnits(); }

    for (const car of units.cars) car.update(dt, state);
    for (const rb of units.roadblocks) rb.update(dt, state);
    if (units.heli) units.heli.update(dt, state);

    const dispatchUnits = [];
    for (const car of units.cars) {
      const dx = car.mesh.position.x - state.player.x;
      const dz = car.mesh.position.z - state.player.z;
      dispatchUnits.push({ icon: '🚓', callSign: car.callSign, distance: Math.round(Math.hypot(dx, dz)), tag: car.behaviour || 'PURSUIT' });
    }
    for (const rb of units.roadblocks) dispatchUnits.push({ icon: '🚧', callSign: rb.callSign, distance: Math.round(Math.hypot(rb.x - state.player.x, rb.z - state.player.z)), tag: 'ROADBLOCK' });
    if (units.heli) dispatchUnits.push({ icon: '🚁', callSign: units.heli.callSign, distance: Math.round(Math.hypot(units.heli.mesh.position.x - state.player.x, units.heli.mesh.position.z - state.player.z)), tag: 'SPOTLIGHT' });
    dispatchUnits.sort((a, b) => a.distance - b.distance);
    state.dispatch = { visible: h.stars > 0, stars: h.stars, units: dispatchUnits.slice(0, 6), more: Math.max(0, dispatchUnits.length - 4) };
    state.wanted = { searching: h.search > 0.5 && h.stars > 0, status: h.search > 0.5 ? 'SEARCHING' : (h.stars >= 4 ? 'AIR UNIT OVERHEAD' : '') };
    state.minimap = state.minimap || {};
    state.minimap.police = units.cars.map(c => ({ x: c.mesh.position.x, z: c.mesh.position.z, yaw: c.yaw || c.mesh.rotation.y }));
    if (h.stars === 0) { state.dispatch.units = []; state.dispatch.visible = false; state.minimap.police = []; state.wanted = { searching: false, status: '' }; }
  }

  return { update, heat, units, reportCrime: (type, now) => heat.reportCrime(type, now), clearUnits };
}
