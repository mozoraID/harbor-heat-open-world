// Builds the police cruiser vehicle mesh variant.
import * as THREE from 'three';

function policeTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f3f4f6'; ctx.fillRect(0, 0, 256, 128);
  // black hood/front
  ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, 256, 30);
  // blue SHP stripe and PATROL
  ctx.fillStyle = '#1d4ed8'; ctx.fillRect(0, 54, 256, 20);
  ctx.fillStyle = '#93c5fd'; ctx.fillRect(0, 74, 256, 3);
  ctx.fillStyle = '#0f172a'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PATROL', 128, 49);
  ctx.fillStyle = '#1d4ed8'; ctx.font = 'bold 22px sans-serif';
  ctx.fillText('SHP', 128, 108);
  // side door hint panels
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(30, 82, 70, 26); ctx.fillRect(156, 82, 70, 26);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildPolice(g, bodyMat, glass, dark) {
  const mat = new THREE.MeshStandardMaterial({ map: policeTexture(), color: 0xffffff, roughness: 0.45, metalness: 0.18 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.2, 4.3), mat);
  body.position.y = 0.95; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 1.1), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.2 }));
  hood.position.set(0, 1.45, 1.35); g.add(hood);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.7, 1.8), glass);
  cab.position.set(0, 1.58, -0.1); cab.castShadow = true; g.add(cab);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.14, 0.36), dark);
  bar.position.set(0, 2.02, -0.1); g.add(bar);
  const red = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), new THREE.MeshStandardMaterial({ color: 0xff3355, emissive: 0xff2244, emissiveIntensity: 1.0 }));
  red.position.set(-0.32, 2.16, -0.1); g.add(red);
  const blue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), new THREE.MeshStandardMaterial({ color: 0x3388ff, emissive: 0x2266ff, emissiveIntensity: 1.0 }));
  blue.position.set(0.32, 2.16, -0.1); g.add(blue);
  const push = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 0.15), new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.6, metalness: 0.4 }));
  push.position.set(0, 0.55, 2.2); g.add(push);
  return { len: 4.3, wid: 1.95, h: 1.2 };
}
