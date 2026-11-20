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
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  // background
  ctx.fillStyle = ad.bg;
  ctx.fillRect(0, 0, 256, 128);
  // accent stripe
  ctx.fillStyle = ad.accent;
  ctx.fillRect(0, 0, 256, 18);
  ctx.fillRect(0, 110, 256, 18);
  // border
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 244, 116);
  // title
  ctx.fillStyle = ad.fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  // wrap simple
  const words = ad.title.split(' ');
  let line = '', lines = [];
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > 230 && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  const baseY = 62 - (lines.length - 1) * 12;
  lines.forEach((l, i) => ctx.fillText(l, 128, baseY + i * 24));
  // sub
  if (ad.sub) {
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = ad.accent;
    ctx.fillText(ad.sub, 128, 96);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function addBillboards(scene, layout, rng) {
  const group = new THREE.Group();

  // 8 billboards on rooftops and roadsides
  const placements = [
    { x: -260, z: -120, y: 16, ry: Math.PI * 0.1, w: 18, h: 9, on: 'rooftop' }, // docks
    { x: 120, z: -80, y: 18, ry: -Math.PI * 0.3, w: 18, h: 9, on: 'rooftop' }, // hills/heights
    { x: 260, z: 60, y: 20, ry: Math.PI, w: 20, h: 10, on: 'rooftop' }, // heights
    { x: -40, z: 120, y: 8, ry: Math.PI * 0.5, w: 16, h: 8, on: 'roadside' },
    { x: 80, z: 200, y: 8, ry: -Math.PI * 0.4, w: 16, h: 8, on: 'roadside' }, // near bridge
    { x: -120, z: 320, y: 8, ry: Math.PI * 0.2, w: 16, h: 8, on: 'roadside' }, // near pier
    { x: 40, z: 380, y: 7, ry: Math.PI, w: 14, h: 7, on: 'roadside' }, // beach
    { x: 220, z: -220, y: 14, ry: -Math.PI * 0.15, w: 18, h: 9, on: 'rooftop' }, // hills
  ];

  const poleMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
  const backMat = new THREE.MeshLambertMaterial({ color: 0x333333 });

  placements.forEach((p, i) => {
    const ad = ADS[i % ADS.length];
    const tex = makeAdTexture(ad);
    const faceMat = new THREE.MeshBasicMaterial({ map: tex });
    const b = new THREE.Group();

    const boardGeo = new THREE.BoxGeometry(p.w, p.h, 0.6);
    // materials: +x,-x,+y,-y,+z,-z ; front is +z
    const mats = [backMat, backMat, backMat, backMat, faceMat, backMat];
    const board = new THREE.Mesh(boardGeo, mats);
    board.position.y = p.h / 2;
    b.add(board);

    // poles/support
    if (p.on === 'roadside') {
      for (const side of [-1, 1]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, p.y, 6), poleMat);
        pole.position.set(side * (p.w * 0.35), -p.y / 2, 0);
        b.add(pole);
      }
    } else {
      // rooftop base frame
      const base = new THREE.Mesh(new THREE.BoxGeometry(p.w * 0.8, 1.2, 2.0), poleMat);
      base.position.y = -0.6;
      b.add(base);
      const brace = new THREE.Mesh(new THREE.BoxGeometry(0.4, p.h * 0.5, 0.4), poleMat);
      brace.position.set(0, -0.6 - p.h * 0.25, -0.8);
      b.add(brace);
    }

    b.position.set(p.x, p.y, p.z);
    b.rotation.y = p.ry;
    group.add(b);
  });

  scene.add(group);
  return { update: () => {}, group };
}
