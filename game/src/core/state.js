// Central mutable game state shared across systems.
import { createRng } from './rng.js';
import { WORLD } from './constants.js';

export function createState(seed = WORLD.seed) {
  const rng = createRng(seed);
  return {
    seed,
    rng,
    time: 0,
    dt: 0,
    mode: 'title',
    shot: null,
    player: {
      x: 0, y: 0, z: 0, yaw: Math.PI, vy: 0, onGround: true, speed: 0,
      inCar: null, health: 100, armour: 0, money: 240, wanted: 0,
      action: null, actionTime: 0, activeWeapon: 3, dead: false, busted: false,
    },
    car: null,
    cars: [],
    pedestrians: null,
    traffic: null,
    effects: null,
    police: null,
    combat: null,
    weapons: null,
    colliders: [],
    districtName: 'Marigold Beach',
    camera: { yaw: Math.PI, pitch: 0.18, dist: 6.5, targetFov: 60 },
    world: { layout: null, blocks: [], width: 0, depth: 0, bounds: null },
    hud: { mission: 'Welcome to Port Solenne', objective: 'Explore Marigold Beach and find a ride.', toast: '' },
    respawn: { state: null, timer: 0, label: '' },
  };
}
