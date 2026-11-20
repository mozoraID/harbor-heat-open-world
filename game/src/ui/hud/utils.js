// HUD formatting and math helpers.
export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function fmtMoney(n) {
  const v = Math.floor(Number(n) || 0);
  return 'S$ ' + v.toLocaleString('en-US');
}
export function fmtClock(v) {
  if (typeof v === 'string') return v;
  const t = Number(v) || 0;
  const h = Math.floor(t / 60) % 24;
  const m = Math.floor(t % 60);
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}
export function fmtCountdown(sec) {
  if (sec == null) return '';
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ':' + String(r).padStart(2, '0');
}
export function hashSeed(str) {
  let h = 2166136261;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function seeded(seed) {
  let x = hashSeed(seed) || 123456789;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
}
export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
