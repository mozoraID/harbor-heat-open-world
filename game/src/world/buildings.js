// Procedurally generates district-styled buildings with canvas window textures.
import * as THREE from 'three';
import { WORLD } from '../core/constants.js';
import { createRng } from '../core/rng.js';
import { createBuildingTexture } from './textures.js';

const DISTRICT_STYLES = {
  beach: { colors: ['#ffd7ba', '#ffe8c7', '#f9c6d3', '#cde7f0'], accents: ['#fff', '#f7f0df'], h: [8, 22], count: [2, 4] },
  pier: { colors: ['#f5d6ba', '#e8dcc8', '#b7d4e8', '#f2b8a0'], accents: ['#fff', '#eee'], h: [8, 18], count: [2, 4] },
  heights: { colors: ['#d7f0ff', '#c9d6ff', '#f5d9ff', '#e8f7ff'], accents: ['#ffffff', '#dff6ff'], h: [28, 70], count: [2, 4] },
  docks: { colors: ['#b8c0c8', '#c9b8a8', '#aab4be', '#d2c4b0'], accents: ['#f0f0f0', '#ddd'], h: [10, 26], count: [2, 5] },
  hills: { colors: ['#f7e6c8', '#f2d0a7', '#e8d8c3', '#ffdcb8'], accents: ['#fff', '#f7efe2'], h: [6, 16], count: [2, 4] },
  bridge: { colors: ['#d9e6f2', '#cfd8dc', '#e3edf7'], accents: ['#fff', '#eef'], h: [12, 24], count: [1, 3] },
};

export function createBuildings(scene, layout) {
  const group = new THREE.Group();
  const colliders = [];
  const materialsCache = new Map();

  function getMaterial(district, rng, floors) {
    const key = district + ':' + Math.floor(rng() * 1000) + ':' + floors;
    if (materialsCache.has(key) && rng() > 0.5) return materialsCache.get(key);
    const style = DISTRICT_STYLES[district] || DISTRICT_STYLES.beach;
    const base = style.colors[Math.floor(rng() * style.colors.length)];
    const accent = style.accents[Math.floor(rng() * style.accents.length)];
    const tex = createBuildingTexture(createRng(Math.floor(rng() * 1e9)), base, accent, Math.max(4, Math.floor(floors / 3)), 4);
    tex.repeat.set(1, Math.max(1, floors / 12));
    const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff, roughness: 0.7, metalness: 0.05 });
    materialsCache.set(key, mat);
    return mat;
  }

  for (const block of layout.blocks) {
    const brng = createRng(block.seed ^ 0x9e3779b9);
    const style = DISTRICT_STYLES[block.district] || DISTRICT_STYLES.beach;
    const count = brng.int(style.count[0], style.count[1]);
    const margin = 4;
    const inner = block.size - margin * 2;
    for (let n = 0; n < count; n++) {
      const bw = brng.range(inner * 0.28, inner * 0.55);
      const bd = brng.range(inner * 0.28, inner * 0.55);
      const h = brng.range(style.h[0], style.h[1]) * (block.district === 'heights' ? 1.15 : 1);
      const px = block.x + brng.range(-inner / 2 + bw / 2, inner / 2 - bw / 2);
      const pz = block.z + brng.range(-inner / 2 + bd / 2, inner / 2 - bd / 2);
      const geom = new THREE.BoxGeometry(bw, h, bd);
      const mat = getMaterial(block.district, brng, h);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(px, h / 2, pz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // roof accent
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(bw + 0.4, 0.4, bd + 0.4),
        new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.6 })
      );
      roof.position.set(px, h + 0.2, pz);
      roof.castShadow = true;
      roof.receiveShadow = true;
      group.add(roof);

      colliders.push({ x: px, z: pz, hw: bw / 2 + 0.6, hd: bd / 2 + 0.6, minY: 0, maxY: h });
    }
  }

  scene.add(group);
  return { group, colliders };
}
