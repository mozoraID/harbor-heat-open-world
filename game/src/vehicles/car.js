// Car entity state and arcade driving physics update.
import * as THREE from 'three';
import { PHYSICS } from '../core/constants.js';
import { clamp, damp } from '../core/math.js';
import { resolveCircleColliders } from '../core/collisions.js';
import { createCarMesh } from './carModels.js';

export function createCar(scene, opts = {}) {
  const mesh = createCarMesh(opts.type || 'sedan', opts.color || '#e4572e');
  mesh.position.set(opts.x || 0, 0, opts.z || 0);
  mesh.rotation.y = opts.yaw || 0;
  scene.add(mesh);
  const car = {
    mesh,
    type: opts.type || 'sedan',
    name: opts.name || 'Sedan',
    x: mesh.position.x,
    z: mesh.position.z,
    yaw: opts.yaw || 0,
    speed: 0,
    steer: 0,
    radius: 1.6,
    driver: null,
    maxSpeed: opts.maxSpeed || PHYSICS.carMaxSpeed,
  };
  return car;
}

export function updateCar(car, dt, control, colliders, bounds) {
  // control: { throttle: -1..1, steer: -1..1, brake: bool, handbrake: bool }
  const accel = control.throttle * PHYSICS.carAccel;
  const braking = control.brake || (control.throttle !== 0 && Math.sign(control.throttle) !== Math.sign(car.speed) && Math.abs(car.speed) > 0.2);
  if (braking) {
    const b = PHYSICS.carBrake * dt;
    if (Math.abs(car.speed) <= b) car.speed = 0; else car.speed -= Math.sign(car.speed) * b;
  } else {
    car.speed += accel * dt;
  }
  // drag
  car.speed *= Math.pow(0.985, dt * 60);
  car.speed = clamp(car.speed, -PHYSICS.carReverse, car.maxSpeed);

  const turnFactor = clamp(Math.abs(car.speed) / 6, 0, 1);
  const hb = control.handbrake ? 1.8 : 1.0;
  car.yaw += control.steer * PHYSICS.carTurn * turnFactor * dt * Math.sign(car.speed || 1) * hb;

  const nx = car.mesh.position.x + Math.sin(car.yaw) * car.speed * dt;
  const nz = car.mesh.position.z + Math.cos(car.yaw) * car.speed * dt;
  const resolved = resolveCircleColliders(nx, nz, car.radius, colliders, bounds);
  if (Math.abs(resolved.x - nx) > 0.001 || Math.abs(resolved.z - nz) > 0.001) {
    car.speed *= -0.2;
  }
  car.mesh.position.x = resolved.x;
  car.mesh.position.z = resolved.z;
  car.mesh.rotation.y = car.yaw;
  car.x = car.mesh.position.x;
  car.z = car.mesh.position.z;

  // simple body roll/tilt visual
  car.mesh.rotation.z = damp(car.mesh.rotation.z || 0, -control.steer * clamp(car.speed / car.maxSpeed, 0, 1) * 0.06, 6, dt);
}

export function parkCars(scene, layout, count, rng) {
  const cars = [];
  const types = [
    { type: 'sedan', name: 'Coastline Sedan', colors: ['#3a86ff', '#e4572e', '#8ac926', '#6c757d'] },
    { type: 'taxi', name: 'Solenne Taxi', colors: ['#ffd166'] },
    { type: 'sports', name: 'Vanta Coupe', colors: ['#ff4d6d', '#00b4d8', '#f77f00'] },
    { type: 'pickup', name: 'Marina Pickup', colors: ['#52796f', '#774936', '#386641'] },
    { type: 'van', name: 'Dock Van', colors: ['#adb5bd', '#f4a261', '#457b9d'] },
  ];
  for (let i = 0; i < count; i++) {
    const b = layout.blocks[Math.floor(rng() * layout.blocks.length)];
    const side = Math.floor(rng() * 4);
    const offset = layout.roadWidth * 0.45;
    let x = b.x, z = b.z, yaw = 0;
    if (side === 0) { x = b.x - b.size / 2 - offset; z = b.z + rng.range(-8, 8); yaw = 0; }
    if (side === 1) { x = b.x + b.size / 2 + offset; z = b.z + rng.range(-8, 8); yaw = Math.PI; }
    if (side === 2) { z = b.z - b.size / 2 - offset; x = b.x + rng.range(-8, 8); yaw = Math.PI / 2; }
    if (side === 3) { z = b.z + b.size / 2 + offset; x = b.x + rng.range(-8, 8); yaw = -Math.PI / 2; }
    const spec = types[Math.floor(rng() * types.length)];
    const color = spec.colors[Math.floor(rng() * spec.colors.length)];
    const car = createCar(scene, { x, z, yaw, type: spec.type, color, name: spec.name, maxSpeed: spec.type === 'sports' ? 31 : spec.type === 'pickup' ? 23 : 26 });
    cars.push(car);
  }
  return cars;
}
