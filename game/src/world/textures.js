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

export function createBuildingTexture(rng, base, accent, floors = 8, cols = 4, glassy = false) {
  return makeCanvas(128, 256, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const winW = w / (cols * 2);
    const winH = h / (floors * 2.2);
    for (let y = 0; y < floors; y++) {
      for (let x = 0; x < cols; x++) {
        const lit = rng() > 0.3;
        if (glassy) {
          ctx.fillStyle = lit ? 'rgba(180,235,255,0.9)' : 'rgba(80,120,150,0.8)';
        } else {
          ctx.fillStyle = lit ? '#ffe9a8' : '#364155';
        }
        const px = (x + 0.5) * (w / cols) - winW / 2 + (rng() - 0.5) * 2;
        const py = (y + 0.7) * (h / floors) - winH / 2;
        ctx.fillRect(px, py, winW, winH);
        ctx.strokeStyle = accent;
        ctx.lineWidth = glassy ? 1.5 : 1;
        ctx.strokeRect(px, py, winW, winH);
        if (glassy && rng() > 0.5) {
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fillRect(px + 1, py + 1, winW * 0.3, winH * 0.6);
        }
      }
    }
    if (glassy) {
      for (let y = 0; y < floors; y += 3) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(0, (y + 0.3) * (h / floors), w, 3);
      }
    }
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(0,0,0,${rng() * 0.05})`;
      ctx.fillRect(rng() * w, rng() * h, 2, 2);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, 0, w, 5);
  });
}

export function createSidewalkTexture() {
  return makeCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#d8d1c3';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = `rgba(120,110,95,${Math.random() * 0.08})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 32) { ctx.beginPath(); ctx.moveTo(x + 1, 0); ctx.lineTo(x + 1, h); ctx.stroke(); }
  });
}

export function createSandTexture() {
  return makeCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#efd3a5';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(150,120,80,${Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 1);
    }
  });
}

