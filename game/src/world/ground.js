// Builds ground surfaces: roads with markings, raised sidewalks, sand, and docks.
import * as THREE from 'three';
import { COLORS, WORLD } from '../core/constants.js';
import { createSidewalkTexture, createSandTexture } from './textures.js';
import { createAsphaltTexture, createRoadStripeTexture, createCenterLineTexture } from './roadTexture.js';
import { createCrosswalks } from './crosswalks.js';

export function createGround(scene, layout) {
  const group = new THREE.Group();
  const { width, depth } = layout;

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x8d775f, roughness: 1 });
  const base = new THREE.Mesh(new THREE.PlaneGeometry(width * 2.4, depth * 2.4), baseMat);
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.06;
  base.receiveShadow = true;
  group.add(base);

  const asphalt = createAsphaltTexture();
  asphalt.repeat.set(width / 28, depth / 28);
  const roadMat = new THREE.MeshStandardMaterial({ map: asphalt, color: 0xffffff, roughness: 0.92 });
  const roadPlane = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), roadMat);
  roadPlane.rotation.x = -Math.PI / 2;
  roadPlane.position.y = 0.01;
  roadPlane.receiveShadow = true;
  group.add(roadPlane);

  // dashed lane markers and yellow center lines along each road corridor
  const dashV = createRoadStripeTexture('v');
  dashV.repeat.set(1, layout.cell / 10);
  const dashH = createRoadStripeTexture('h');
  dashH.repeat.set(layout.cell / 10, 1);
  const centerV = createCenterLineTexture('v');
  centerV.repeat.set(1, layout.cell / 12);
  const centerH = createCenterLineTexture('h');
  centerH.repeat.set(layout.cell / 12, 1);
  const markMatV = new THREE.MeshStandardMaterial({ map: dashV, transparent: true, roughness: 0.6, depthWrite: false });
  const markMatH = new THREE.MeshStandardMaterial({ map: dashH, transparent: true, roughness: 0.6, depthWrite: false });
  const cMatV = new THREE.MeshStandardMaterial({ map: centerV, transparent: true, roughness: 0.6, depthWrite: false });
  const cMatH = new THREE.MeshStandardMaterial({ map: centerH, transparent: true, roughness: 0.6, depthWrite: false });
  const rw = layout.roadWidth;
  for (let i = 0; i <= layout.n; i++) {
    const x = layout.offsetX + i * layout.cell + rw / 2;
    const v = new THREE.Mesh(new THREE.PlaneGeometry(rw * 0.7, depth - rw), markMatV);
    v.rotation.x = -Math.PI / 2; v.position.set(x, 0.032, 0); group.add(v);
    const cv = new THREE.Mesh(new THREE.PlaneGeometry(rw * 0.22, depth - rw), cMatV);
    cv.rotation.x = -Math.PI / 2; cv.position.set(x, 0.033, 0); group.add(cv);
  }
  for (let j = 0; j <= layout.n; j++) {
    const z = layout.offsetZ + j * layout.cell + rw / 2;
    const h = new THREE.Mesh(new THREE.PlaneGeometry(width - rw, rw * 0.7), markMatH);
    h.rotation.x = -Math.PI / 2; h.position.set(0, 0.032, z); group.add(h);
    const ch = new THREE.Mesh(new THREE.PlaneGeometry(width - rw, rw * 0.22), cMatH);
    ch.rotation.x = -Math.PI / 2; ch.position.set(0, 0.033, z); group.add(ch);
  }

  const swTex = createSidewalkTexture();
  swTex.repeat.set(2, 2);
  const swMat = new THREE.MeshStandardMaterial({ map: swTex, color: COLORS.sidewalk, roughness: 0.96 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xbfb7a6, roughness: 0.9 });
  for (const b of layout.blocks) {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(WORLD.blockSize + 2, 0.15, WORLD.blockSize + 2), swMat);
    sw.position.set(b.x, 0.075, b.z);
    sw.receiveShadow = true;
    sw.castShadow = true;
    group.add(sw);
    // kerb lip
    const kerb = new THREE.Mesh(new THREE.BoxGeometry(WORLD.blockSize + 2.4, 0.08, WORLD.blockSize + 2.4), curbMat);
    kerb.position.set(b.x, 0.04, b.z);
    kerb.receiveShadow = true;
    group.add(kerb);
  }

  createCrosswalks(scene, layout);

  const sandTex = createSandTexture();
  sandTex.repeat.set(14, 5);
  const sandMat = new THREE.MeshStandardMaterial({ map: sandTex, color: COLORS.sand, roughness: 1 });
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.8, 110), sandMat);
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, 0.02, depth / 2 + 35);
  sand.receiveShadow = true;
  group.add(sand);

  const dockMat = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.8 });
  const dock = new THREE.Mesh(new THREE.BoxGeometry(160, 0.2, 90), dockMat);
  dock.position.set(-width * 0.28, 0.1, depth / 2 - 10);
  dock.receiveShadow = true;
  group.add(dock);

  scene.add(group);
  return { group };
}
