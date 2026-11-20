// Procedural road asphalt and marking textures for Port Solenne streets.
import * as THREE from 'three';

function canvasTex(w, h, draw, repeatX = 1, repeatY = 1) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = 4;
  return t;
}

export function createAsphaltTexture() {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2f3640';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      const a = 0.03 + Math.random() * 0.08;
      const g = 40 + Math.floor(Math.random() * 40);
      ctx.fillStyle = `rgba(${g + 10},${g + 14},${g + 20},${a})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1);
    }
    for (let i = 0; i < 700; i++) {
      const a = Math.random() * 0.05;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  });
}

export function createRoadStripeTexture(orientation = 'v') {
  return canvasTex(128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#f3f1e8';
    ctx.lineWidth = 5;
    ctx.setLineDash([18, 14]);
    ctx.beginPath();
    if (orientation === 'v') { ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); }
    else { ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); }
    ctx.stroke();
    // faint edge wear
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (orientation === 'v') { ctx.moveTo(w / 2 - 7, 0); ctx.lineTo(w / 2 - 7, h); ctx.moveTo(w / 2 + 7, 0); ctx.lineTo(w / 2 + 7, h); }
    else { ctx.moveTo(0, h / 2 - 7); ctx.lineTo(w, h / 2 - 7); ctx.moveTo(0, h / 2 + 7); ctx.lineTo(w, h / 2 + 7); }
    ctx.stroke();
  });
}

export function createCenterLineTexture(orientation = 'v') {
  return canvasTex(128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#f0c84b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (orientation === 'v') { ctx.moveTo(w / 2 - 4, 0); ctx.lineTo(w / 2 - 4, h); ctx.moveTo(w / 2 + 4, 0); ctx.lineTo(w / 2 + 4, h); }
    else { ctx.moveTo(0, h / 2 - 4); ctx.lineTo(w, h / 2 - 4); ctx.moveTo(0, h / 2 + 4); ctx.lineTo(w, h / 2 + 4); }
    ctx.stroke();
  });
}

export function createCrosswalkTexture() {
  return canvasTex(128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f4f4f0';
    for (let i = 0; i < 7; i++) ctx.fillRect(8, 6 + i * 17, w - 16, 9);
  });
}
