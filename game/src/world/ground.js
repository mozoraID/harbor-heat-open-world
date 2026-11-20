// Builds ground surfaces: roads, sidewalks, sand, and grass base planes.
import * as THREE from 'three';
import { COLORS, WORLD } from '../core/constants.js';
import { createRoadTexture, createSidewalkTexture, createSandTexture } from './textures.js';

export function createGround(scene, layout) {
  const group = new THREE.Group();
  const { width, depth } = layout;

  // Base ground
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x8d775f, roughness: 1 });
  const base = new THREE.Mesh(new THREE.PlaneGeometry(width * 2.2, depth * 2.2), baseMat);
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.05;
  base.receiveShadow = true;
  group.add(base);

  // Road network: one big plane with grid texture approximation via many strips
  const roadTex = createRoadTexture();
  roadTex.repeat.set(width / 16, depth / 16);
  const roadMat = new THREE.MeshStandardMaterial({ map: roadTex, color: COLORS.road, roughness: 0.9 });
  const roadPlane = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), roadMat);
  roadPlane.rotation.x = -Math.PI / 2;
  roadPlane.position.y = 0.01;
  roadPlane.receiveShadow = true;
  group.add(roadPlane);

  const swTex = createSidewalkTexture();
  swTex.repeat.set(2, 2);
  const swMat = new THREE.MeshStandardMaterial({ map: swTex, color: COLORS.sidewalk, roughness: 0.95 });

  const cell = layout.cell;
  const half = WORLD.blockSize / 2;
  for (const b of layout.blocks) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(WORLD.blockSize + 2, WORLD.blockSize + 2), swMat);
    sw.rotation.x = -Math.PI / 2;
    sw.position.set(b.x, 0.03, b.z);
    sw.receiveShadow = true;
    group.add(sw);
  }

  // Beach sand strip along south
  const sandTex = createSandTexture();
  sandTex.repeat.set(12, 4);
  const sandMat = new THREE.MeshStandardMaterial({ map: sandTex, color: COLORS.sand, roughness: 1 });
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.6, 90), sandMat);
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, 0.02, depth / 2 + 25);
  sand.receiveShadow = true;
  group.add(sand);

  // Marina/dock concrete near south-west
  const dockMat = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.8 });
  const dock = new THREE.Mesh(new THREE.PlaneGeometry(140, 80), dockMat);
  dock.rotation.x = -Math.PI / 2;
  dock.position.set(-width * 0.28, 0.04, depth / 2 - 10);
  dock.receiveShadow = true;
  group.add(dock);

  scene.add(group);
  return { group };
}
