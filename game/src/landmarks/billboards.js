import * as THREE from 'three';

const ADS = [
  { title: 'Vortex GT — Own the Coast', bg: '#0b1020', fg: '#ffcc4d', accent: '#ff5e57', sub: 'Test drive today' },
  { title: 'Pier 9 Diner — Open 24/7', bg: '#1e4d8f', fg: '#ffffff', accent: '#ff6b6b', sub: 'Burgers • Shakes • Coffee' },
  { title: 'SALT FM Dock Funk 88.4', bg: '#0f7b6c', fg: '#ffffff', accent: '#ffdd59', sub: 'All night grooves' },
  { title: 'Glasswater Bank', bg: '#e8eef7', fg: '#16324f', accent: '#3ee6b0', sub: 'Secure your future' },
  { title: 'Lucky Gull Arcade', bg: '#5b2a86', fg: '#ffffff', accent: '#4bcffa', sub: 'Play. Win. Repeat.' },
  { title: 'Marigold Sunscreen SPF 50', bg: '#ffb347', fg: '#3b2b20', accent: '#ffffff', sub: 'Beach ready' },
  { title: 'Cinder Hills Realty', bg: '#2c3e50', fg: '#ecf0f1', accent: '#f39c12', sub: 'Villas with a view' },
  { title: 'Ferro Freight Co.', bg: '#6b4f2a', fg: '#fff6d5', accent: '#2ecc71', sub: 'We move the city' },
];

function makeAdTexture(ad) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = ad.bg;
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = ad.accent;
  ctx.fillRect(0, 0, 512, 34);
  ctx.fillRect(0, 222, 512, 34);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 492, 236);
  ctx.fillStyle = ad.fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 44px "Segoe UI", Arial, sans-serif';
  const words = ad.title.split(' ');
  let line = '', lines = [];
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > 460 && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  const baseY = 124 - (lines.length - 1) * 24;
  lines.forEach((l, i) => ctx.fillText(l, 256, baseY + i * 48));
  if (ad.sub) {
    ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = ad.accent;
    ctx.fillText(ad.sub, 256, 192);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function addBillboards(scene, layout, rng) {
  const group = new THREE.Group();

  // 8x4m boards on 6m posts, placed to read well around city
  const placements = [
    { x: -260, z: -210, y: 6, ry: Math.PI * 0.15, on: 'roadside' }, // Ferro Docks
    { x: -120, z: -120, y: 6, ry: -Math.PI * 0.3, on: 'roadside' },
    { x: 140, z: -80, y: 6, ry: Math.PI * 0.8, on: 'roadside' },  // Glasswater
    { x: 260, z: -200, y: 6, ry: -Math.PI * 0.2, on: 'roadside' }, // Cinder Hills
    { x: 40, z: 80, y: 6, ry: Math.PI * 0.1, on: 'roadside' },
    { x: -180, z: 200, y: 6, ry: Math.PI * 0.35, on: 'roadside' }, // toward Old Pier
    { x: 80, z: 230, y: 6, ry: -Math.PI * 0.25, on: 'roadside' },  // toward Lagoon Bridge
    { x: 0, z: 330, y: 6, ry: Math.PI, on: 'roadside' },            // beach approach
  ];

  const poleMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
  const backMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const W = 8, H = 4, poleH = 6;

  placements.forEach((p, i) => {
    const ad = ADS[i % ADS.length];
    const tex = makeAdTexture(ad);
    const faceMat = new THREE.MeshBasicMaterial({ map: tex });
    const b = new THREE.Group();

    const boardGeo = new THREE.BoxGeometry(W, H, 0.5);
    const mats = [backMat, backMat, backMat, backMat, faceMat, backMat]; // +z front
    const board = new THREE.Mesh(boardGeo, mats);
    board.position.y = poleH + H / 2;
    b.add(board);

    for (const side of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, poleH, 8), poleMat);
      pole.position.set(side * (W * 0.35), poleH / 2, 0);
      b.add(pole);
    }
    const brace = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.25, 0.25), poleMat);
    brace.position.set(0, poleH, -0.2);
    b.add(brace);

    b.position.set(p.x, 0, p.z);
    b.rotation.y = p.ry;
    group.add(b);
  });

  scene.add(group);
  return { update: () => {}, group };
}
