// Simple AABB collision resolution against building colliders and world bounds.
import { clamp } from './math.js';

export function resolveCircleColliders(x, z, radius, colliders, bounds) {
  let nx = x, nz = z;
  if (bounds) {
    nx = clamp(nx, bounds.minX + radius, bounds.maxX - radius);
    nz = clamp(nz, bounds.minZ + radius, bounds.maxZ - radius);
  }
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    const closestX = clamp(nx, c.x - c.hw, c.x + c.hw);
    const closestZ = clamp(nz, c.z - c.hd, c.z + c.hd);
    const dx = nx - closestX;
    const dz = nz - closestZ;
    const d2 = dx * dx + dz * dz;
    if (d2 < radius * radius) {
      if (d2 === 0) {
        // push out along smallest axis
        const px = (c.hw + radius) - Math.abs(nx - c.x);
        const pz = (c.hd + radius) - Math.abs(nz - c.z);
        if (px < pz) nx += nx < c.x ? -px : px; else nz += nz < c.z ? -pz : pz;
      } else {
        const d = Math.sqrt(d2);
        const push = radius - d;
        nx += (dx / d) * push;
        nz += (dz / d) * push;
      }
    }
  }
  return { x: nx, z: nz };
}

export function findDistrict(blocks, x, z) {
  let best = null;
  let bestD = Infinity;
  for (const b of blocks) {
    const dx = x - b.x;
    const dz = z - b.z;
    const d = dx * dx + dz * dz;
    if (d < bestD) { bestD = d; best = b; }
  }
  return best ? best.districtName : 'Port Solenne';
}
