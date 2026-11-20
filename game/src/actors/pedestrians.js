// Spawns and updates ambient sidewalk pedestrians around the player.
import * as THREE from 'three';
import { createPedestrianModel, animatePedestrian } from './pedestrianModel.js';

export function createPedestrians(scene, state, count = 36) {
  const group = new THREE.Group();
  scene.add(group);
  const peds = [];
  for (let i = 0; i < count; i++) {
    const model = createPedestrianModel(state.rng);
    const ped = spawnPed(state, model);
    peds.push(ped);
    group.add(model);
  }

  function spawnPed(state, model) {
    const b = state.world.blocks[Math.floor(state.rng() * state.world.blocks.length)];
    const side = Math.floor(state.rng() * 4);
    const off = b.size / 2 + 1.2;
    let x = b.x, z = b.z, dir = 0;
    if (side === 0) { x = b.x - off; z = b.z + state.rng.range(-b.size / 2, b.size / 2); dir = 0; }
    if (side === 1) { x = b.x + off; z = b.z + state.rng.range(-b.size / 2, b.size / 2); dir = Math.PI; }
    if (side === 2) { z = b.z - off; x = b.x + state.rng.range(-b.size / 2, b.size / 2); dir = Math.PI / 2; }
    if (side === 3) { z = b.z + off; x = b.x + state.rng.range(-b.size / 2, b.size / 2); dir = -Math.PI / 2; }
    model.position.set(x, 0.15, z);
    model.rotation.y = dir;
    model.visible = true;
    return { model, x, z, dir, speed: state.rng.range(0.8, 1.5), flee: 0, down: 0, dead: false, health: 40 };
  }

  function update(dt, state) {
    const px = state.player.x, pz = state.player.z;
    for (const ped of peds) {
      if (ped.dead) { ped.model.visible = false; continue; }
      if (ped.down > 0) { ped.down -= dt; ped.model.rotation.x = -Math.PI / 2.5; ped.model.position.y = 0.35; ped.model.rotation.z = 0.2; if (ped.down <= 0) { ped.model.rotation.x = 0; ped.model.rotation.z = 0; ped.model.position.y = 0.15; } continue; }
      ped.model.rotation.x = 0; ped.model.rotation.z = 0; ped.model.position.y = 0.15;
      const dx = ped.x - px, dz = ped.z - pz;
      const d2 = dx * dx + dz * dz;
      if (d2 < 70) { ped.flee = 2.5; ped.dir = Math.atan2(dx, dz); }
      if (ped.flee > 0) ped.flee -= dt;
      const sp = ped.speed * (ped.flee > 0 ? 2.6 : 1);
      ped.x += Math.sin(ped.dir) * sp * dt;
      ped.z += Math.cos(ped.dir) * sp * dt;
      if (Math.random() < 0.01) ped.dir += (Math.random() - 0.5) * 0.8;
      ped.model.position.set(ped.x, 0.15, ped.z);
      ped.model.rotation.y = ped.dir;
      animatePedestrian(ped.model, dt, sp, ped.flee > 0);
      // car hit check
      const car = state.car && state.player.inCar ? state.car : null;
      if (car && Math.abs(car.speed) > 3) {
        const cdx = ped.x - car.mesh.position.x, cdz = ped.z - car.mesh.position.z;
        if (cdx * cdx + cdz * cdz < 3.5) {
          ped.down = 4; ped.health -= 40;
          if (ped.health <= 0) ped.dead = true;
          if (state.police && state.police.reportCrime) state.police.reportCrime(ped.dead ? 'killPed' : 'hitPed', state.time);
        }
      }
      // recycle if too far or long dead
      const rx = ped.x - px, rz = ped.z - pz;
      if (rx * rx + rz * rz > 220 * 220) Object.assign(ped, spawnPed(state, ped.model));
    }
  }

  return { group, peds, update };
}
