// Generates the city block grid, district assignments, and world dimensions.
import { WORLD, DISTRICTS } from '../core/constants.js';

export function districtFor(i, j) {
  const n = WORLD.grid;
  // i = east-west (0 west), j = north-south (0 north)
  if (j >= n - 2) return 'beach';
  if (j >= n - 3 && i <= 2) return 'pier';
  if (i >= 4 && i <= 7 && j >= n - 4 && j <= n - 3) return 'bridge';
  if (i <= 2 && j >= n - 4) return 'pier';
  if (i >= 8 && j <= 4) return 'hills';
  if (i >= 7 && j >= 5 && j <= 8) return 'heights';
  if (i <= 3 && j <= 4) return 'docks';
  if (j <= 2) return 'docks';
  if (i >= 5) return 'heights';
  return 'hills';
}

export function createLayout(rng) {
  const n = WORLD.grid;
  const cell = WORLD.blockSize + WORLD.roadWidth;
  const width = n * cell + WORLD.roadWidth;
  const depth = n * cell + WORLD.roadWidth;
  const offsetX = -width / 2;
  const offsetZ = -depth / 2;
  const blocks = [];

  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = offsetX + WORLD.roadWidth + i * cell + WORLD.blockSize / 2;
      const z = offsetZ + WORLD.roadWidth + j * cell + WORLD.blockSize / 2;
      const district = districtFor(i, j);
      blocks.push({
        i, j, x, z,
        size: WORLD.blockSize,
        district,
        districtName: DISTRICTS[district] || district,
        seed: ((i * 73856093) ^ (j * 19349663)) >>> 0,
      });
    }
  }

  return { blocks, n, cell, width, depth, offsetX, offsetZ, roadWidth: WORLD.roadWidth };
}
