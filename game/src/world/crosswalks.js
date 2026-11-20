// Places zebra crosswalk meshes at road intersections around each city block.
import * as THREE from 'three';
import { WORLD } from '../core/constants.js';
import { createCrosswalkTexture } from './roadTexture.js';

export function createCrosswalks(scene, layout) {
  const tex = createCrosswalkTexture();
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.8, depthWrite: false });
  const group = new THREE.Group();
  const rw = WORLD.roadWidth;
  const hw = rw * 0.55;
  const len = rw * 0.9;
  const y = 0.035;

  for (const b of layout.blocks) {
    const half = b.size / 2;
    const offsets = [
      { x: b.x, z: b.z - half - rw / 2, ry: 0 },
      { x: b.x, z: b.z + half + rw / 2, ry: 0 },
      { x: b.x - half - rw / 2, z: b.z, ry: Math.PI / 2 },
      { x: b.x + half + rw / 2, z: b.z, ry: Math.PI / 2 },
    ];
    for (const o of offsets) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(hw, len), mat);
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = o.ry;
      m.position.set(o.x, y, o.z);
      m.receiveShadow = true;
      group.add(m);
    }
  }

  scene.add(group);
  return { group };
}
