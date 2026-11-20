// Seeded pseudo-random number generator for deterministic world and shot generation.
export function createRng(seed = 1) {
  let s = (seed >>> 0) || 1;
  function next() {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  }
  next.int = (min, max) => Math.floor(next() * (max - min + 1)) + min;
  next.range = (min, max) => min + next() * (max - min);
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  next.bool = (p = 0.5) => next() < p;
  return next;
}
