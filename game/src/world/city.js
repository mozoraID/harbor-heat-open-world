// Assembles the complete Port Solenne city from layout, terrain, buildings, and props.
import { createLayout } from './layout.js';
import { createSky } from './sky.js';
import { createGround } from './ground.js';
import { createBuildings } from './buildings.js';
import { createProps } from './props.js';
import { createWater } from './water.js';

export function createCity(scene, state) {
  const layout = createLayout(state.rng);
  state.world.layout = layout;
  state.world.width = layout.width;
  state.world.depth = layout.depth;

  const sky = createSky(scene);
  const ground = createGround(scene, layout);
  const buildings = createBuildings(scene, layout);
  const props = createProps(scene, layout);
  const water = createWater(scene, layout);

  state.colliders = buildings.colliders;
  state.world.blocks = layout.blocks;

  // boundary colliders to keep player roughly in town
  const pad = 10;
  state.world.bounds = {
    minX: layout.offsetX - pad,
    maxX: layout.offsetX + layout.width + pad,
    minZ: layout.offsetZ - pad,
    maxZ: layout.offsetZ + layout.depth + 120,
  };

  return { layout, sky, ground, buildings, props, water };
}
