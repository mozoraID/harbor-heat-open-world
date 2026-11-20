// Individual traffic car behavior: lane following, turning, and simple obstacle stops.
import * as THREE from 'three';
import { createCarMesh } from '../vehicles/carModels.js';

const TYPES = [
  { type: 'sedan', name: 'Sedan', colors: ['#3a86ff', '#e4572e', '#8ac926', '#6c757d', '#ffd166'] },
  { type: 'taxi', name: 'Taxi', colors: ['#ffd166'] },
  { type: 'van', name: 'Van', colors: ['#adb5bd', '#457b9d'] },
  { type: 'pickup', name: 'Pickup', colors: ['#52796f', '#774936'] },
];

function pickEdge(graph, rng, avoidNodeId = -1) {
  let e = graph.edges[Math.floor(rng() * graph.edges.length)];
  for (let i = 0; i < 20 && e.b.id === avoidNodeId; i++) e = graph.edges[Math.floor(rng() * graph.edges.length)];
  return e;
}

export function createTrafficCar(scene, state, graph) {
  const spec = TYPES[Math.floor(state.rng() * TYPES.length)];
  const color = spec.colors[Math.floor(state.rng() * spec.colors.length)];
  const mesh = createCarMesh(spec.type, color);
  scene.add(mesh);
  const edge = pickEdge(graph, state.rng);
  const lane = (state.rng() < 0.5 ? 1 : -1) * 2.2;
  const car = { mesh, type: spec.type, name: spec.name, edge, t: state.rng(), speed: 0, target: state.rng.range(8, 13), lane, yaw: 0, stopped: 0, radius: 1.6, traffic: true, damage: 0, driver: 'npc' };
  placeOnEdge(car);
  return car;
}

function placeOnEdge(car) {
  const { a, b } = car.edge;
  const dx = b.x - a.x, dz = b.z - a.z;
  const len = Math.hypot(dx, dz) || 1;
  const nx = -dz / len, nz = dx / len;
  car.yaw = Math.atan2(dx, dz);
  car.mesh.position.set(a.x + dx * car.t + nx * car.lane, 0, a.z + dz * car.t + nz * car.lane);
  car.mesh.rotation.y = car.yaw;
}

export function updateTrafficCar(car, dt, state, graph, cars) {
  if (car.driver === 'player') return;
  if (car.hijacked) {
    if (state.player && state.player.action === 'steal' && state.player.actionTarget === car) {
      car.speed = 0;
      return;
    }
    car.hijacked = false;
  }
  // simple traffic light stop near nodes
  const { a, b } = car.edge;
  const dx = b.x - a.x, dz = b.z - a.z;
  const len = Math.hypot(dx, dz) || 1;
  const stopZone = (car.t > 0.82) && ((Math.floor(state.time * 0.4) + b.id) % 3 === 0);
  let desired = car.target;
  if (stopZone) desired = 0;
  // avoid player (on foot or in car) ahead in lane / standing on road
  const px = state.player.x, pz = state.player.z;
  const cx = car.mesh.position.x, cz = car.mesh.position.z;
  const vx = px - cx, vz = pz - cz;
  const fwd = vx * Math.sin(car.yaw) + vz * Math.cos(car.yaw);
  const side = Math.abs(vx * Math.cos(car.yaw) - vz * Math.sin(car.yaw));
  const d2 = vx * vx + vz * vz;
  const inFront = fwd > 0 && fwd < 16 && side < 2.8;
  const veryClose = d2 < 25;
  if (state.player && !state.player.inCar && (inFront || (fwd > -1 && fwd < 10 && side < 3.5))) desired = 0;
  else if (inFront) desired = 0;
  else if (veryClose) desired = Math.min(desired, 1.0);
  // mild lateral nudge when player stands in road close ahead
  if (state.player && !state.player.inCar && inFront && fwd < 10) {
    car.mesh.position.x += (vx * Math.cos(car.yaw) - vz * Math.sin(car.yaw) > 0 ? -1 : 1) * 0.04;
  }

  car.speed += (desired - car.speed) * Math.min(1, dt * 2.5);
  car.t += (car.speed * dt) / len;
  placeOnEdge(car);
  // brake lights
  const mats = car.mesh.userData.tailMats;
  if (mats) mats.forEach(m => m.emissiveIntensity = desired < car.speed - 0.5 ? 1.2 : 0.2);

  if (car.t >= 1) {
    const outs = graph.outgoing.get(b.id) || [];
    if (outs.length) {
      car.edge = outs[Math.floor(state.rng() * outs.length)];
      car.t = 0;
    } else {
      car.edge = pickEdge(graph, state.rng, b.id);
      car.t = 0;
    }
  }
  // recycle if very far
  const rx = car.mesh.position.x - px, rz = car.mesh.position.z - pz;
  if (rx * rx + rz * rz > 260 * 260) {
    car.edge = pickEdge(graph, state.rng);
    car.t = state.rng();
    placeOnEdge(car);
  }
}
