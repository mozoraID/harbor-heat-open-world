// Procedural canvas textures for buildings, roads, and details.
import * as THREE from 'three';

function makeCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function createBuildingTexture(rng, base, accent, floors = 8, cols = 4) {
  return makeCanvas(128, 256, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const winW = w / (cols * 2);
    const winH = h / (floors * 2.2);
    for (let y = 0; y < floors; y++) {
      for (let x = 0; x < cols; x++) {
        const lit = rng() > 0.35;
        ctx.fillStyle = lit ? '#ffe9a8' : '#334';
        const px = (x + 0.5) * (w / cols) - winW / 2 + (rng() - 0.5) * 2;
        const py = (y + 0.7) * (h / floors) - winH / 2;
        ctx.fillRect(px, py, winW, winH);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, winW, winH);
      }
    }
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = `rgba(0,0,0,${rng() * 0.06})`;
      ctx.fillRect(rng() * w, rng() * h, 2, 2);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, 0, w, 6);
  });
}

export function createRoadTexture() {
  return makeCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#3b4048';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#454b54';
    for (let i = 0; i < 500; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    ctx.strokeStyle = '#f2efe6';
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 10]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.stroke();
  });
}

export function createSidewalkTexture() {
  return makeCanvas(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#d9d2c2';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    for (let x = 0; x <= w; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  });
}

export function createSandTexture() {
  return makeCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#f2d3a3';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `rgba(140,110,70,${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 1);
    }
  });
}
