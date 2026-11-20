// Car entity state and arcade driving physics update with damage and drift.
import * as THREE from 'three';
import { PHYSICS } from '../core/constants.js';
import { clamp, damp } from '../core/math.js';
import { resolveCircleColliders } from '../core/collisions.js';
import { createCarMesh } from './carModels.js';

export function createCarState(opts = {}) {
  const mesh = opts.mesh || null;
  return {
    mesh,
    type: opts.type || 'sedan',
    name: opts.name || 'Sedan',
    x: opts.x ?? (mesh ? mesh.position.x : 0),
    z: opts.z ?? (mesh ? mesh.position.z : 0),
    yaw: opts.yaw || 0,
    speed: opts.speed ?? 0,
    radius: opts.radius || 1.7,
    driver: opts.driver ?? null,
    maxSpeed: opts.maxSpeed || PHYSICS.carMaxSpeed,
    damage: opts.damage ?? 0,
    health: opts.health ?? 100,
    smoke: opts.smoke ?? 0,
    dead: opts.dead ?? false,
  };
}

export function createCar(scene, opts = {}) {
  const mesh = createCarMesh(opts.type || 'sedan', opts.color || '#e4572e');
  mesh.position.set(opts.x || 0, 0, opts.z || 0);
  mesh.rotation.y = opts.yaw || 0;
  scene.add(mesh);
  return createCarState({ ...opts, mesh });
}

export function updateCar(car, dt, control, colliders, bounds, state) {
  if (!Number.isFinite(car.speed)) car.speed = 0;
  if (car.dead) { car.speed = damp(car.speed, 0, 3, dt); car.mesh.position.x += Math.sin(car.yaw) * car.speed * dt; car.mesh.position.z += Math.cos(car.yaw) * car.speed * dt; return; }
  const accelBase = PHYSICS.carAccel * (car.type === 'sports' ? 1.2 : car.type === 'armoured' ? 0.8 : 1);
  let accel = (control.throttle || 0) * accelBase;
  const reversingIntent = control.throttle < 0 && car.speed <= 0.5;
  if (reversingIntent) accel = control.throttle * accelBase * 0.7;
  const braking = control.brake || (control.throttle > 0 && car.speed < -0.5) || (control.throttle < 0 && car.speed > 0.5);
  if (braking) {
    const b = PHYSICS.carBrake * dt;
    if (Math.abs(car.speed) <= b) car.speed = 0; else car.speed -= Math.sign(car.speed) * b;
  } else {
    car.speed += accel * dt;
  }
  const drag = control.handbrake ? 0.975 : 0.988;
  car.speed *= Math.pow(drag, dt * 60);
  const revMax = -PHYSICS.carReverse;
  car.speed = clamp(car.speed, revMax, car.maxSpeed * (1 - car.damage * 0.25));

  const speedFactor = clamp(Math.abs(car.speed) / 7, 0, 1);
  const steerMul = (0.35 + speedFactor * 0.85) * (control.handbrake ? 1.9 : 1.0);
  const dir = Math.abs(car.speed) < 0.2 ? (control.throttle < 0 ? -1 : 1) : Math.sign(car.speed);
  car.yaw += (control.steer || 0) * PHYSICS.carTurn * steerMul * dt * dir;

  const nx = car.mesh.position.x + Math.sin(car.yaw) * car.speed * dt;
  const nz = car.mesh.position.z + Math.cos(car.yaw) * car.speed * dt;
  const resolved = resolveCircleColliders(nx, nz, car.radius, colliders, bounds);
  let hit = false;
  if (Math.abs(resolved.x - nx) > 0.01 || Math.abs(resolved.z - nz) > 0.01) {
    hit = true;
    car.damage = Math.min(1, car.damage + Math.abs(car.speed) * 0.008);
    car.health = Math.max(0, 100 - car.damage * 100);
    car.speed *= -0.25;
    if (state && state.effects) state.effects.spark((nx + resolved.x) / 2, 0.8, (nz + resolved.z) / 2);
  }
  car.mesh.position.x = resolved.x;
  car.mesh.position.z = resolved.z;
  car.mesh.rotation.y = car.yaw;
  car.mesh.rotation.z = damp(car.mesh.rotation.z || 0, -(control.steer || 0) * clamp(car.speed / car.maxSpeed, 0, 1) * (control.handbrake ? 0.12 : 0.06), 6, dt);
  car.x = car.mesh.position.x; car.z = car.mesh.position.z;

  const tailMats = car.mesh.userData.tailMats || [];
  const brakingNow = braking || (control.throttle < 0 && car.speed > 0.5);
  for (const m of tailMats) m.emissiveIntensity = brakingNow ? 1.4 : 0.18;

  if (car.damage > 0.35) car.smoke = Math.min(1, car.smoke + dt * 0.5);
  if (car.damage > 0.55 && state && state.effects && Math.random() < 0.15) state.effects.smoke(car.x, 1.1, car.z - Math.cos(car.yaw) * 1.2, 0.7);
  if (car.health <= 0 && !car.dead) {
    car.dead = true; car.speed = 0; car.exploded = true;
    if (state && state.effects) { state.effects.explode(car.x, 1.2, car.z); state.effects.smoke(car.x, 1.5, car.z, 1.6); }
    if (state && state.police && state.police.reportCrime) state.police.reportCrime('explosion', state.time);
  } else if (car.health <= 0) { car.dead = true; car.speed = 0; }
}

export function parkCars(scene, layout, count, rng) {
  const cars = [];
  const types = [
    { type: 'sedan', name: 'Coastline Sedan', colors: ['#3a86ff', '#e4572e', '#8ac926', '#6c757d', '#f4a261'] },
    { type: 'taxi', name: 'Solenne Taxi', colors: ['#ffd166'] },
    { type: 'sports', name: 'Vanta Coupe', colors: ['#ff4d6d', '#00b4d8', '#f77f00', '#c77dff'] },
    { type: 'pickup', name: 'Marina Pickup', colors: ['#52796f', '#774936', '#386641'] },
    { type: 'van', name: 'Dock Van', colors: ['#adb5bd', '#f4a261', '#457b9d'] },
    { type: 'police', name: 'SHP Cruiser', colors: ['#1f2937'] },
    { type: 'armoured', name: 'BULWARK Truck', colors: ['#39424e'] },
    { type: 'bike', name: 'Street Bike', colors: ['#ff595e', '#1982c4', '#222'] },
  ];
  for (let i = 0; i < count; i++) {
    const b = layout.blocks[Math.floor(rng() * layout.blocks.length)];
    const side = Math.floor(rng() * 4);
    const offset = layout.roadWidth * 0.45;
    let x = b.x, z = b.z, yaw = 0;
    const jitter = rng.range(-9, 9);
    if (side === 0) { x = b.x - b.size / 2 - offset; z = b.z + jitter; yaw = 0; }
    if (side === 1) { x = b.x + b.size / 2 + offset; z = b.z + jitter; yaw = Math.PI; }
    if (side === 2) { z = b.z - b.size / 2 - offset; x = b.x + jitter; yaw = Math.PI / 2; }
    if (side === 3) { z = b.z + b.size / 2 + offset; x = b.x + jitter; yaw = -Math.PI / 2; }
    const spec = types[Math.floor(rng() * types.length)];
    const color = spec.colors[Math.floor(rng() * spec.colors.length)];
    const car = createCar(scene, {
      x, z, yaw, type: spec.type, color, name: spec.name,
      maxSpeed: spec.type === 'sports' ? 32 : spec.type === 'bike' ? 30 : spec.type === 'armoured' ? 21 : spec.type === 'pickup' ? 24 : 27,
      radius: spec.type === 'bike' ? 1.0 : spec.type === 'armoured' ? 2.0 : 1.7,
      driver: rng() < 0.35 ? 'npc' : null,
    });
    cars.push(car);
  }
  return cars;
}
