// Builds procedural vehicle meshes by type using per-model builders.
import * as THREE from 'three';
import { buildSedan } from './model_sedan.js';
import { buildTaxi } from './model_taxi.js';
import { buildSports } from './model_sports.js';
import { buildVan } from './model_van.js';
import { buildPickup } from './model_pickup.js';
import { buildPolice } from './model_police.js';
import { buildArmoured } from './model_armoured.js';
import { buildBike } from './model_bike.js';

function carTexture(baseColor) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseColor; ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(18, 8, 34, 12); ctx.fillRect(76, 8, 34, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, 28, 128, 4);
  ctx.fillStyle = '#f8e08e'; ctx.fillRect(0, 22, 7, 8); ctx.fillRect(121, 22, 7, 8);
  ctx.fillStyle = '#ff4b3e'; ctx.fillRect(0, 36, 7, 6); ctx.fillRect(121, 36, 7, 6);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createCarMesh(type = 'sedan', color = '#e4572e') {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ map: carTexture(color), color: 0xffffff, roughness: 0.42, metalness: 0.22 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xa9d9ff, roughness: 0.08, metalness: 0.25, transparent: true, opacity: 0.72 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x20242b, roughness: 0.85 });

  let dims = { len: 4.2, wid: 1.9, h: 1.2 };
  if (type === 'sedan') dims = buildSedan(g, bodyMat, glass, dark);
  else if (type === 'taxi') dims = buildTaxi(g, bodyMat, glass, dark);
  else if (type === 'sports') dims = buildSports(g, bodyMat, glass, dark);
  else if (type === 'van') dims = buildVan(g, bodyMat, glass, dark);
  else if (type === 'pickup') dims = buildPickup(g, bodyMat, glass, dark);
  else if (type === 'police') dims = buildPolice(g, bodyMat, glass, dark);
  else if (type === 'armoured') dims = buildArmoured(g, bodyMat, glass, dark);
  else if (type === 'bike') dims = buildBike(g, bodyMat, glass, dark);
  else dims = buildSedan(g, bodyMat, glass, dark);

  const wheelGeo = type === 'bike' ? new THREE.CylinderGeometry(0.34, 0.34, 0.18, 12) : new THREE.CylinderGeometry(0.36, 0.36, 0.28, 12);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.95 });
  const wpos = type === 'bike'
    ? [[0, 0.34, dims.len / 2 - 0.45], [0, 0.34, -dims.len / 2 + 0.45]]
    : [[-dims.wid / 2 - 0.02, 0.36, dims.len / 2 - 0.85], [dims.wid / 2 + 0.02, 0.36, dims.len / 2 - 0.85], [-dims.wid / 2 - 0.02, 0.36, -dims.len / 2 + 0.85], [dims.wid / 2 + 0.02, 0.36, -dims.len / 2 + 0.85]];
  const wheels = [];
  for (const wp of wpos) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2; w.position.set(wp[0], wp[1], wp[2]); w.castShadow = true; g.add(w); wheels.push(w);
  }

  const tailMatL = new THREE.MeshStandardMaterial({ color: 0x661111, emissive: 0xff2222, emissiveIntensity: 0.15 });
  const tailMatR = tailMatL.clone();
  const tl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.05), tailMatL); tl.position.set(-dims.wid * 0.28, 0.75, -dims.len / 2 - 0.02); g.add(tl);
  const tr = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.05), tailMatR); tr.position.set(dims.wid * 0.28, 0.75, -dims.len / 2 - 0.02); g.add(tr);
  g.userData.size = dims;
  g.userData.tailMats = [tailMatL, tailMatR];
  g.userData.wheels = wheels;
  return g;
}
