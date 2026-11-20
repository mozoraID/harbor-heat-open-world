// Places decorative props like palm trees, street lamps, and boardwalk items.
import * as THREE from 'three';
import { createRng } from '../core/rng.js';

function makePalm() {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 1 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 5, 6), trunkMat);
  trunk.position.y = 2.5;
  trunk.castShadow = true;
  g.add(trunk);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f8f4e, roughness: 0.9, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.25, 3.2, 4), leafMat);
    leaf.position.y = 5.2;
    leaf.rotation.z = Math.PI / 2.4;
    leaf.rotation.y = (i / 6) * Math.PI * 2;
    leaf.castShadow = true;
    g.add(leaf);
  }
  return g;
}

function makeLamp() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5.5, 6), new THREE.MeshStandardMaterial({ color: 0x444, roughness: 0.5, metalness: 0.4 }));
  pole.position.y = 2.75;
  pole.castShadow = true;
  g.add(pole);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffcc66, emissiveIntensity: 0.6 }));
  head.position.set(0.5, 5.4, 0);
  g.add(head);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x444 }));
  arm.position.set(0.2, 5.4, 0);
  g.add(arm);
  return g;
}

function makeCrane() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xd08b2e, roughness: 0.7, metalness: 0.2 });
  const mast = new THREE.Mesh(new THREE.BoxGeometry(1.2, 18, 1.2), mat);
  mast.position.y = 9; mast.castShadow = true; g.add(mast);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 0.8), mat);
  arm.position.set(5, 17.5, 0); arm.castShadow = true; g.add(arm);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x6b7b8c }));
  cab.position.set(0, 16.2, 0); g.add(cab);
  return g;
}

export function createProps(scene, layout) {
  const group = new THREE.Group();
  for (const block of layout.blocks) {
    const rng = createRng(block.seed ^ 0x51ed270b);
    // street lamps near corners
    const corners = [
      [block.x - block.size / 2 - 1.5, block.z - block.size / 2 - 1.5],
      [block.x + block.size / 2 + 1.5, block.z - block.size / 2 - 1.5],
      [block.x - block.size / 2 - 1.5, block.z + block.size / 2 + 1.5],
      [block.x + block.size / 2 + 1.5, block.z + block.size / 2 + 1.5],
    ];
    for (const c of corners) {
      if (rng() < 0.55) {
        const lamp = makeLamp();
        lamp.position.set(c[0], 0, c[1]);
        group.add(lamp);
      }
    }
    // palms on beach/pier/bridge boulevards
    if (block.district === 'beach' || block.district === 'pier') {
      const count = rng.int(1, 4);
      for (let i = 0; i < count; i++) {
        const p = makePalm();
        p.position.set(block.x + rng.range(-10, 10), 0, block.z + rng.range(-10, 10));
        p.rotation.y = rng.range(0, Math.PI * 2);
        const s = rng.range(0.8, 1.3);
        p.scale.setScalar(s);
        group.add(p);
      }
    } else if (rng() < 0.25) {
      const p = makePalm();
      p.position.set(block.x + block.size / 2 + 1.2, 0, block.z + rng.range(-8, 8));
      p.scale.setScalar(0.9);
      group.add(p);
    }
    if (block.district === 'docks' && rng() < 0.2) {
      const crane = makeCrane();
      crane.position.set(block.x + rng.range(-8, 8), 0, block.z + rng.range(-8, 8));
      crane.rotation.y = rng.range(0, Math.PI * 2);
      group.add(crane);
    }
  }

  // extra palms along beach strip
  const beachRng = createRng(424242);
  for (let i = 0; i < 40; i++) {
    const p = makePalm();
    p.position.set(beachRng.range(-layout.width * 0.7, layout.width * 0.7), 0, layout.depth / 2 + beachRng.range(5, 55));
    p.scale.setScalar(beachRng.range(0.9, 1.4));
    group.add(p);
  }

  scene.add(group);
  return { group };
}
