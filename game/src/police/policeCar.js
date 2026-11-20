// Police pursuit vehicle AI with chase, ram behavior, and flashing siren lights.
import * as THREE from 'three';
import { createCar, updateCar } from '../vehicles/car.js';

export function createPoliceCar(scene, state, opts = {}) {
  const angle = state.rng() * Math.PI * 2;
  const dist = 40 + state.rng() * 40;
  const x = state.player.x + Math.cos(angle) * dist;
  const z = state.player.z + Math.sin(angle) * dist;
  const car = createCar(scene, { x, z, yaw: 0, type: 'police', color: '#1f2937', name: 'SHP Cruiser', maxSpeed: opts.type === 'interceptor' ? 30 : 28, driver: 'police' });
  car.callSign = opts.callSign || 'GULL-01';
  car.variant = opts.type || 'cruiser';
  car.behaviour = 'PURSUIT';
  car.hasSight = true;
  car.flash = 0;

  const red = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.28), new THREE.MeshStandardMaterial({ color: 0xff3355, emissive: 0xff3355, emissiveIntensity: 1.2 }));
  red.position.set(-0.28, 2.1, -0.1);
  const blue = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.28), new THREE.MeshStandardMaterial({ color: 0x3388ff, emissive: 0x3388ff, emissiveIntensity: 1.2 }));
  blue.position.set(0.28, 2.1, -0.1);
  car.mesh.add(red); car.mesh.add(blue);
  car.siren = { red, blue };

  car.update = function(dt, state) {
    const tx = state.player.x, tz = state.player.z;
    const dx = tx - car.mesh.position.x, dz = tz - car.mesh.position.z;
    const d = Math.hypot(dx, dz) || 1;
    car.hasSight = d < 120;
    const desiredYaw = Math.atan2(dx, dz);
    let steer = desiredYaw - car.yaw;
    while (steer > Math.PI) steer -= Math.PI * 2;
    while (steer < -Math.PI) steer += Math.PI * 2;
    steer = Math.max(-1, Math.min(1, steer * 1.2));
    const throttle = d > 8 ? 1 : 0.3;
    car.behaviour = d < 10 ? 'RAMMING' : (car.variant === 'interceptor' ? 'FLANKING' : 'PURSUIT');
    car.flash += dt * 10;
    const on = Math.sin(car.flash) > 0;
    car.siren.red.material.emissiveIntensity = on ? 2.0 : 0.1;
    car.siren.blue.material.emissiveIntensity = on ? 0.1 : 2.0;
    updateCar(car, dt, { throttle, steer, brake: false, handbrake: false }, state.colliders, state.world.bounds, state);
  };
  return car;
}
