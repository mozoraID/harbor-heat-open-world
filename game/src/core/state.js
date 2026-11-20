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
    mode: 'title', // title, play, pause, map, phone, shot
    shot: null,
    ready: false,
    player: {
      x: 0, y: 0, z: 0,
      yaw: Math.PI,
      vy: 0,
      onGround: true,
      speed: 0,
      inCar: null,
      health: 100,
      armour: 0,
      money: 240,
      wanted: 0,
    },
    car: null,
    cars: [],
    buildings: [],
    colliders: [],
    roadTiles: [],
    districtName: 'Marigold Beach',
    camera: { yaw: Math.PI, pitch: 0.25, dist: 7, targetFov: 60 },
    input: { forward: 0, right: 0, sprint: false, jump: false, enter: false, lookDX: 0, lookDY: 0, pointerLocked: false },
    world: { grid: null, blocks: [], width: 0, depth: 0 },
    hud: { mission: 'Welcome to Port Solenne', objective: 'Explore Marigold Beach and find a ride.' },
  };
}
