// Places palm trees, lamps, benches, bins, hydrants, traffic lights, and billboards.
import * as THREE from 'three';
import { createRng } from '../core/rng.js';

function makePalm(rng) {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 1 });
  const h = rng.range(4.2, 6.2);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, h, 7), trunkMat);
  trunk.position.y = h / 2; trunk.castShadow = true; g.add(trunk);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f8f4e, roughness: 0.9, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.22, 3.4, 4), leafMat);
    leaf.position.y = h + 0.2;
    leaf.rotation.z = Math.PI / 2.3;
    leaf.rotation.y = (i / 7) * Math.PI * 2;
    leaf.castShadow = true; g.add(leaf);
  }
  return g;
}

function makeLamp() {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x3e4652, roughness: 0.45, metalness: 0.5 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 5.8, 6), metal);
  pole.position.y = 2.9; pole.castShadow = true; g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.08), metal);
  arm.position.set(0.45, 5.6, 0); g.add(arm);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfff3c8, emissive: 0xffd978, emissiveIntensity: 0.8 }));
  head.position.set(0.9, 5.55, 0); g.add(head);
  return g;
}

function makeBench() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x9b6b43, roughness: 0.9 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x555, roughness: 0.6, metalness: 0.3 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.6), wood);
  seat.position.y = 0.55; seat.castShadow = true; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.1), wood);
  back.position.set(0, 0.9, -0.25); g.add(back);
  for (const x of [-0.7, 0.7]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.5), metal);
    leg.position.set(x, 0.28, 0); g.add(leg);
  }
  return g;
}

function makeBin() {
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0x2f6b4f, roughness: 0.8 }));
  bin.position.y = 0.45; bin.castShadow = true; return bin;
}

function makeHydrant() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0xd94b3d, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.7, 8), m);
  body.position.y = 0.35; g.add(body);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), m); cap.position.y = 0.7; g.add(cap);
  g.castShadow = true; return g;
}

function makeTrafficLight() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.8, 6), new THREE.MeshStandardMaterial({ color: 0x444, roughness: 0.5, metalness: 0.4 }));
  pole.position.y = 2.4; pole.castShadow = true; g.add(pole);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.2, 0.4), new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.7 }));
  box.position.set(0, 4.4, 0.2); g.add(box);
  const cols = [0x44ff66, 0xffdd44, 0xff4444];
  for (let i = 0; i < 3; i++) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: cols[i], emissive: cols[i], emissiveIntensity: i === 0 ? 0.8 : 0.15 }));
    l.position.set(0, 4.75 - i * 0.35, 0.42); g.add(l);
  }
  return g;
}

function makeBillboard(rng) {
  const g = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.7, metalness: 0.2 });
  for (const x of [-1.5, 1.5]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 7, 6), poleMat);
    p.position.set(x, 3.5, 0); p.castShadow = true; g.add(p);
  }
  const ads = [
    ['VANTA MOTOR', '#ff4d6d'], ['SOL WAVE RADIO', '#4fd1c5'], ['LAGOON COLA', '#8fd3ff'], ['SALT & SUN', '#ffe17a'],
  ];
  const ad = ads[Math.floor(rng() * ads.length)];
  const c = document.createElement('canvas'); c.width = 256; c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#101826'; ctx.fillRect(0, 0, 256, 96);
  ctx.fillStyle = ad[1]; ctx.font = 'bold 34px system-ui, Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(ad[0], 128, 42);
  ctx.fillStyle = '#fff'; ctx.font = '18px system-ui, Arial'; ctx.fillText('Port Solenne Original', 128, 72);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.8, 0.2), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: new THREE.Color(ad[1]), emissiveIntensity: 0.2 }));
  board.position.set(0, 6.2, 0); board.castShadow = true; g.add(board);
  return g;
}

function makeCrane() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xd08b2e, roughness: 0.7, metalness: 0.2 });
  const mast = new THREE.Mesh(new THREE.BoxGeometry(1.2, 20, 1.2), mat);
  mast.position.y = 10; mast.castShadow = true; g.add(mast);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 0.8), mat);
  arm.position.set(6, 19.5, 0); arm.castShadow = true; g.add(arm);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x6b7b8c }));
  cab.position.set(0, 18.2, 0); g.add(cab);
  return g;
}

export function createProps(scene, layout) {
  const group = new THREE.Group();
  for (const block of layout.blocks) {
    const rng = createRng(block.seed ^ 0x51ed270b);
    const corners = [
      [block.x - block.size / 2 - 1.8, block.z - block.size / 2 - 1.8],
      [block.x + block.size / 2 + 1.8, block.z - block.size / 2 - 1.8],
      [block.x - block.size / 2 - 1.8, block.z + block.size / 2 + 1.8],
      [block.x + block.size / 2 + 1.8, block.z + block.size / 2 + 1.8],
    ];
    for (const c of corners) {
      const lamp = makeLamp();
      lamp.position.set(c[0], 0, c[1]);
      lamp.rotation.y = rng.range(0, Math.PI * 2);
      group.add(lamp);
      if (rng() < 0.22) {
        const tl = makeTrafficLight();
        tl.position.set(c[0] + rng.range(-1, 1), 0, c[1] + rng.range(-1, 1));
        tl.rotation.y = rng.range(0, Math.PI * 2);
        group.add(tl);
      }
    }

    const edgePalm = block.district === 'beach' || block.district === 'pier' || block.district === 'bridge';
    const palmCount = edgePalm ? rng.int(3, 6) : (rng() < 0.5 ? rng.int(1, 2) : 0);
    for (let i = 0; i < palmCount; i++) {
      const p = makePalm(rng);
      const side = rng.int(0, 3);
      if (side === 0) p.position.set(block.x - block.size / 2 - 2.2, 0, block.z + rng.range(-block.size / 2, block.size / 2));
      if (side === 1) p.position.set(block.x + block.size / 2 + 2.2, 0, block.z + rng.range(-block.size / 2, block.size / 2));
      if (side === 2) p.position.set(block.x + rng.range(-block.size / 2, block.size / 2), 0, block.z - block.size / 2 - 2.2);
      if (side === 3) p.position.set(block.x + rng.range(-block.size / 2, block.size / 2), 0, block.z + block.size / 2 + 2.2);
      p.rotation.y = rng.range(0, Math.PI * 2);
      p.scale.setScalar(rng.range(0.85, 1.35));
      group.add(p);
    }

    if (rng() < 0.35) { const b = makeBench(); b.position.set(block.x + block.size / 2 + 2.6, 0.15, block.z + rng.range(-6, 6)); b.rotation.y = Math.PI / 2; group.add(b); }
    if (rng() < 0.35) { const bin = makeBin(); bin.position.set(block.x - block.size / 2 - 2.4, 0.15, block.z + rng.range(-6, 6)); group.add(bin); }
    if (rng() < 0.25) { const h = makeHydrant(); h.position.set(block.x + rng.range(-6, 6), 0.15, block.z + block.size / 2 + 2.4); group.add(h); }
    if (rng() < 0.18) { const bb = makeBillboard(rng); bb.position.set(block.x + rng.range(-10, 10), 0, block.z - block.size / 2 - 6); group.add(bb); }
    if (block.district === 'docks' && rng() < 0.35) {
      const crane = makeCrane();
      crane.position.set(block.x + rng.range(-10, 10), 0, block.z + rng.range(-10, 10));
      crane.rotation.y = rng.range(0, Math.PI * 2);
      group.add(crane);
    }
  }

  const beachRng = createRng(424242);
  for (let i = 0; i < 70; i++) {
    const p = makePalm(beachRng);
    p.position.set(beachRng.range(-layout.width * 0.75, layout.width * 0.75), 0, layout.depth / 2 + beachRng.range(2, 70));
    p.scale.setScalar(beachRng.range(0.9, 1.5));
    group.add(p);
  }
  for (let i = 0; i < 18; i++) {
    const bb = makeBillboard(beachRng);
    bb.position.set(beachRng.range(-layout.width * 0.5, layout.width * 0.5), 0, layout.depth / 2 - 20 + beachRng.range(-10, 10));
    bb.rotation.y = beachRng.range(-0.4, 0.4);
    group.add(bb);
  }

  scene.add(group);
  return { group };
}
