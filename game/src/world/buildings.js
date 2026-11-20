// Procedurally generates district-styled buildings with pastel facades and roof details.
import * as THREE from 'three';
import { createRng } from '../core/rng.js';
import { createBuildingTexture } from './textures.js';
import { pickFacade } from './palette.js';
import { addShopfront } from './shopfronts.js';

const DISTRICT_CONFIG = {
  beach:   { h: [8, 24], count: [2, 4], glass: 0.05 },
  pier:    { h: [8, 20], count: [2, 4], glass: 0.05 },
  heights: { h: [32, 78], count: [2, 4], glass: 0.6 },
  docks:   { h: [10, 24], count: [2, 5], glass: 0.05 },
  hills:   { h: [6, 16], count: [2, 4], glass: 0.05 },
  bridge:  { h: [14, 26], count: [1, 3], glass: 0.2 },
};

function addRooftopDetails(group, rng, x, z, bw, bd, h, district) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x8f98a3, roughness: 0.8 });
  if (rng() < 0.5) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.6, 8), mat);
    tank.position.set(x + rng.range(-bw * 0.25, bw * 0.25), h + 0.8, z + rng.range(-bd * 0.25, bd * 0.25));
    tank.castShadow = true; group.add(tank);
  }
  if (rng() < 0.5) {
    const ac = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.0), new THREE.MeshStandardMaterial({ color: 0xbfc7cf, roughness: 0.7 }));
    ac.position.set(x + rng.range(-bw * 0.3, bw * 0.3), h + 0.4, z + rng.range(-bd * 0.3, bd * 0.3));
    ac.castShadow = true; group.add(ac);
  }
  if (rng() < 0.35) {
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), new THREE.MeshStandardMaterial({ color: 0x666 }));
    ant.position.set(x + rng.range(-bw * 0.3, bw * 0.3), h + 1.5, z + rng.range(-bd * 0.3, bd * 0.3));
    group.add(ant);
  }
  if ((district === 'heights' || h > 40) && rng() < 0.35) {
    const pool = new THREE.Mesh(new THREE.BoxGeometry(Math.min(bw * 0.5, 6), 0.25, Math.min(bd * 0.4, 4)), new THREE.MeshStandardMaterial({ color: 0x4fd1c5, roughness: 0.2, metalness: 0.1, emissive: 0x1a6a6a, emissiveIntensity: 0.15 }));
    pool.position.set(x, h + 0.2, z);
    group.add(pool);
  }
}

function addSteppedTop(group, rng, x, z, bw, bd, h, color) {
  const levels = rng.int(1, 3);
  let ch = h, cw = bw, cd = bd;
  for (let i = 0; i < levels; i++) {
    cw *= rng.range(0.55, 0.8);
    cd *= rng.range(0.55, 0.8);
    const sh = rng.range(1.2, 3.5);
    const step = new THREE.Mesh(new THREE.BoxGeometry(cw, sh, cd), new THREE.MeshStandardMaterial({ color, roughness: 0.65 }));
    step.position.set(x, ch + sh / 2, z);
    step.castShadow = true; step.receiveShadow = true;
    group.add(step);
    ch += sh;
  }
  return ch;
}

export function createBuildings(scene, layout) {
  const group = new THREE.Group();
  const colliders = [];

  for (const block of layout.blocks) {
    const brng = createRng(block.seed ^ 0x9e3779b9);
    const cfg = DISTRICT_CONFIG[block.district] || DISTRICT_CONFIG.beach;
    const count = brng.int(cfg.count[0], cfg.count[1]);
    const margin = 4.2;
    const inner = block.size - margin * 2;
    for (let n = 0; n < count; n++) {
      const bw = brng.range(inner * 0.28, inner * 0.58);
      const bd = brng.range(inner * 0.28, inner * 0.58);
      let h = brng.range(cfg.h[0], cfg.h[1]) * (block.district === 'heights' ? 1.1 : 1);
      const px = block.x + brng.range(-inner / 2 + bw / 2, inner / 2 - bw / 2);
      const pz = block.z + brng.range(-inner / 2 + bd / 2, inner / 2 - bd / 2);
      const facade = pickFacade(brng, block.district);
      const glassy = facade.glassy || (brng() < cfg.glass);
      const floors = Math.max(3, Math.floor(h / 3.2));
      const tex = createBuildingTexture(createRng(block.seed ^ (n * 2654435761)), facade.base, facade.trim, floors, glassy ? 5 : 4, glassy);
      tex.repeat.set(1, Math.max(1, h / 14));
      const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff, roughness: glassy ? 0.25 : 0.72, metalness: glassy ? 0.15 : 0.04 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, h, bd), mat);
      mesh.position.set(px, h / 2, pz);
      mesh.castShadow = true; mesh.receiveShadow = true;
      group.add(mesh);

      let topY = h;
      if (block.district !== 'docks' && brng() < 0.55) {
        topY = addSteppedTop(group, brng, px, pz, bw, bd, h, facade.trim);
      }
      const roof = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.3, 0.35, bd + 0.3), new THREE.MeshStandardMaterial({ color: facade.trim, roughness: 0.6 }));
      roof.position.set(px, topY + 0.18, pz);
      roof.castShadow = true; roof.receiveShadow = true; group.add(roof);
      addRooftopDetails(group, brng, px, pz, bw, bd, topY, block.district);

      if (h < 28 && brng() < 0.45) {
        const faces = ['north', 'south', 'east', 'west'];
        addShopfront(group, px, 0, pz, bw, bd, faces[brng.int(0, 3)], brng, facade.awning);
      }

      colliders.push({ x: px, z: pz, hw: bw / 2 + 0.6, hd: bd / 2 + 0.6, minY: 0, maxY: h });
    }

    // container stacks in docks
    if (block.district === 'docks') {
      const crng = createRng(block.seed ^ 0xabcdef);
      const colors = [0xc0392b, 0x2980b9, 0x27ae60, 0xf39c12, 0x7f8c8d, 0x16a085];
      for (let k = 0; k < crng.int(2, 6); k++) {
        const cw = crng.range(4, 6), ch = 2.6, cd = 2.4;
        const cx = block.x + crng.range(-12, 12), cz = block.z + crng.range(-12, 12);
        const stack = crng.int(1, 3);
        for (let s = 0; s < stack; s++) {
          const cont = new THREE.Mesh(new THREE.BoxGeometry(cw, ch, cd), new THREE.MeshStandardMaterial({ color: colors[crng.int(0, colors.length - 1)], roughness: 0.8, metalness: 0.1 }));
          cont.position.set(cx, ch / 2 + s * ch, cz);
          cont.rotation.y = crng.bool() ? 0 : Math.PI / 2;
          cont.castShadow = true; cont.receiveShadow = true;
          group.add(cont);
          colliders.push({ x: cx, z: cz, hw: cw / 2 + 0.4, hd: cd / 2 + 0.4, minY: 0, maxY: (s + 1) * ch });
        }
      }
    }
  }

  scene.add(group);
  return { group, colliders };
}
