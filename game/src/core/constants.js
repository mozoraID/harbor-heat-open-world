// Global game constants for world scale, controls, and tuning.
export const WORLD = {
  blockSize: 44,
  roadWidth: 14,
  grid: 12,
  seed: 1,
};

export const PHYSICS = {
  gravity: 22,
  playerSpeed: 6.2,
  playerSprint: 10.5,
  playerJump: 8.5,
  carAccel: 18,
  carBrake: 26,
  carMaxSpeed: 26,
  carReverse: 10,
  carTurn: 1.9,
};

export const CAMERA = {
  fov: 60,
  near: 0.1,
  far: 1200,
};

export const COLORS = {
  skyTop: 0xffc98a,
  skyHorizon: 0xff7b54,
  fog: 0xf4a574,
  ocean: 0x2f88a8,
  sand: 0xf2d3a3,
  road: 0x3b4048,
  sidewalk: 0xd9d2c2,
  lane: 0xf2efe6,
  grass: 0x7fb069,
};

export const DISTRICTS = {
  beach: 'Marigold Beach',
  pier: 'Old Pier',
  heights: 'Glasswater Heights',
  docks: 'Ferro Docks',
  hills: 'Cinder Hills',
  bridge: 'Lagoon Bridge',
};
