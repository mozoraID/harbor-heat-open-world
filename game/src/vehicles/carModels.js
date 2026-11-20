// Builds simple procedural low-poly car meshes for different vehicle types.
import * as THREE from 'three';

function carTexture(baseColor, accent = '#222') {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseColor; ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = accent; ctx.fillRect(0, 20, 128, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(20, 8, 30, 12); ctx.fillRect(78, 8, 30, 12);
  ctx.fillStyle = '#111'; ctx.fillRect(8, 26, 112, 3);
  ctx.fillStyle = '#ffd96a'; ctx.fillRect(0, 24, 6, 8); ctx.fillRect(122, 24, 6, 8);
  ctx.fillStyle = '#ff4b3e'; ctx.fillRect(0, 36, 6, 6); ctx.fillRect(122, 36, 6, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createCarMesh(type = 'sedan', color = '#e4572e') {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ map: carTexture(color), color: 0xffffff, roughness: 0.45, metalness: 0.25 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fd3ff, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.75 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.9 });

  let len = 4.2, wid = 1.9, h = 1.2, cabH = 0.7, cabLen = 1.8;
  if (type === 'sports') { len = 4.4; wid = 1.95; h = 1.05; cabH = 0.55; cabLen = 1.4; }
  if (type === 'taxi') { len = 4.2; wid = 1.9; h = 1.25; }
  if (type === 'pickup') { len = 4.7; wid = 2.0; h = 1.25; cabLen = 1.5; }
  if (type === 'van') { len = 4.6; wid = 2.0; h = 1.6; cabH = 1.0; cabLen = 2.4; }
  if (type === 'police') { len = 4.3; wid = 1.95; h = 1.25; }

  const body = new THREE.Mesh(new THREE.BoxGeometry(wid, h, len), bodyMat);
  body.position.y = h / 2 + 0.35;
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);

  const cab = new THREE.Mesh(new THREE.BoxGeometry(wid * 0.92, cabH, cabLen), glass);
  cab.position.set(0, h + 0.35 + cabH / 2 - 0.05, -0.1);
  cab.castShadow = true;
  g.add(cab);

  const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 12);
  const wheelPositions = [
    [-wid / 2 - 0.05, 0.36, len / 2 - 0.8],
    [wid / 2 + 0.05, 0.36, len / 2 - 0.8],
    [-wid / 2 - 0.05, 0.36, -len / 2 + 0.8],
    [wid / 2 + 0.05, 0.36, -len / 2 + 0.8],
  ];
  for (const wp of wheelPositions) {
    const w = new THREE.Mesh(wheelGeo, dark);
    w.rotation.z = Math.PI / 2;
    w.position.set(wp[0], wp[1], wp[2]);
    w.castShadow = true;
    g.add(w);
  }

  if (type === 'taxi') {
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.25), new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffcc33, emissiveIntensity: 0.3 }));
    sign.position.set(0, h + cabH + 0.5, -0.2);
    g.add(sign);
  }
  if (type === 'police') {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.32), new THREE.MeshStandardMaterial({ color: 0x222 }));
    bar.position.set(0, h + cabH + 0.45, -0.1);
    g.add(bar);
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.28), new THREE.MeshStandardMaterial({ color: 0xff3355, emissive: 0xff2244, emissiveIntensity: 0.5 }));
    r.position.set(-0.28, h + cabH + 0.58, -0.1); g.add(r);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.28), new THREE.MeshStandardMaterial({ color: 0x3388ff, emissive: 0x2266ff, emissiveIntensity: 0.5 }));
    b.position.set(0.28, h + cabH + 0.58, -0.1); g.add(b);
  }
  if (type === 'pickup') {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(wid * 0.95, 0.5, 1.5), new THREE.MeshStandardMaterial({ color: 0x555, roughness: 0.8 }));
    bed.position.set(0, h * 0.55 + 0.35, -1.2);
    g.add(bed);
  }

  g.userData.size = { len, wid };
  return g;
}
