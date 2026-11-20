// Small math helpers for clamping, interpolation, and 2D/3D utilities.
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
export function damp(current, target, lambda, dt) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}
export function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
export function dist2(ax, az, bx, bz) {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}
