// Generates ground-floor shopfront meshes with awnings and invented canvas signs.
import * as THREE from 'three';
import { createRng } from '../core/rng.js';

const SHOP_NAMES = [
  'Coco Loco Tacos', 'Salt & Sun Surf', 'Nova Pharmacy', 'Pier 9 Diner',
  'Mango Motors', 'Lucky Gull Arcade', 'Bayside Laundry', 'Tide Pool Cafe',
  'Solenne Scoops', 'Marigold Market', 'Harbor Vinyl', 'Neon Noodle Bar',
  'Coral Cuts Salon', 'Lagoon Books', 'Drift Cycles', 'Sunset Bodega'
];

function makeSignTexture(name, accent) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, '#0e1520'); g.addColorStop(1, '#1b2636');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = accent; ctx.lineWidth = 4; ctx.strokeRect(3, 3, 250, 58);
  ctx.fillStyle = accent; ctx.font = 'bold 26px system-ui, Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(name, 128, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function addShopfront(group, bx, by, bz, bw, bd, facing, rng, accent) {
  const name = SHOP_NAMES[Math.floor(rng() * SHOP_NAMES.length)];
  const signTex = makeSignTexture(name, accent || '#ffe17a');
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, emissive: new THREE.Color(accent || '#ffe17a'), emissiveIntensity: 0.35, roughness: 0.5 });
  const signH = 1.1, signW = Math.min(bw * 0.7, 6);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(signW, signH), signMat);
  const awningColor = accent || '#ffb88c';
  const awningMat = new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.8, side: THREE.DoubleSide });

  const y = 2.6;
  const depthOff = bd / 2 + 0.02;
  if (facing === 'south') { sign.position.set(bx, y, bz + depthOff); sign.rotation.y = 0; }
  else if (facing === 'north') { sign.position.set(bx, y, bz - depthOff); sign.rotation.y = Math.PI; }
  else if (facing === 'east') { sign.position.set(bx + depthOff, y, bz); sign.rotation.y = Math.PI / 2; }
  else { sign.position.set(bx - depthOff, y, bz); sign.rotation.y = -Math.PI / 2; }
  group.add(sign);

  const awning = new THREE.Mesh(new THREE.BoxGeometry(signW * 0.95, 0.08, 1.2), awningMat);
  awning.castShadow = true;
  if (facing === 'south') { awning.position.set(bx, 2.1, bz + depthOff + 0.55); awning.rotation.x = -0.25; }
  else if (facing === 'north') { awning.position.set(bx, 2.1, bz - depthOff - 0.55); awning.rotation.x = 0.25; }
  else if (facing === 'east') { awning.position.set(bx + depthOff + 0.55, 2.1, bz); awning.rotation.z = 0.25; awning.rotation.y = Math.PI / 2; }
  else { awning.position.set(bx - depthOff - 0.55, 2.1, bz); awning.rotation.z = -0.25; awning.rotation.y = Math.PI / 2; }
  group.add(awning);

  const glass = new THREE.Mesh(new THREE.PlaneGeometry(signW * 0.9, 1.8), new THREE.MeshStandardMaterial({ color: 0x8fd3ff, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.2 }));
  if (facing === 'south') { glass.position.set(bx, 1.1, bz + depthOff - 0.01); }
  else if (facing === 'north') { glass.position.set(bx, 1.1, bz - depthOff + 0.01); glass.rotation.y = Math.PI; }
  else if (facing === 'east') { glass.position.set(bx + depthOff - 0.01, 1.1, bz); glass.rotation.y = Math.PI / 2; }
  else { glass.position.set(bx - depthOff + 0.01, 1.1, bz); glass.rotation.y = -Math.PI / 2; }
  group.add(glass);
}
