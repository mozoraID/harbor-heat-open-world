import * as THREE from 'three';

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function smoothstep(e0, e1, x) {
  const t = clamp01((x - e0) / (e1 - e0 || 1));
  return t * t * (3 - 2 * t);
}
function lerpColor(out, ca, cb, t) {
  out.r = lerp(ca.r, cb.r, t);
  out.g = lerp(ca.g, cb.g, t);
  out.b = lerp(ca.b, cb.b, t);
  return out;
}
function c(hex) { return new THREE.Color(hex); }

// Keyframes over 24h (hours). Interpolated for smooth transitions.
const KEYS = [
  { h: 0,    top:0x040814, mid:0x081225, horizon:0x0b1a2a, glow:0x1a2a44, fog:0x0a1420, fogD:0.0036, sunI:0.0,  sunC:0x8899bb, hemiS:0x223355, hemiG:0x0b1020, hemiI:0.18, ambI:0.12 },
  { h: 4,    top:0x050a18, mid:0x0a1730, horizon:0x13243a, glow:0x223355, fog:0x0c1828, fogD:0.0034, sunI:0.0,  sunC:0x99aacc, hemiS:0x2a3d66, hemiG:0x101828, hemiI:0.22, ambI:0.14 },
  { h: 5.5,  top:0x12264a, mid:0x3a4f78, horizon:0xff9a6a, glow:0xffc27a, fog:0x6a5060, fogD:0.0028, sunI:0.45, sunC:0xffb070, hemiS:0x6a7fa8, hemiG:0x6a5040, hemiI:0.55, ambI:0.35 },
  { h: 7,    top:0x2f6fd6, mid:0x74b4e8, horizon:0xffd9a8, glow:0xfff1c8, fog:0xbfd8e8, fogD:0.0018, sunI:1.6,  sunC:0xfff0d8, hemiS:0xbfe3ff, hemiG:0xb9a07a, hemiI:0.95, ambI:0.55 },
  { h: 12,   top:0x2b6fe0, mid:0x7cc2f2, horizon:0xdff3ff, glow:0xffffff, fog:0xd8ecf6, fogD:0.0014, sunI:2.3,  sunC:0xffffff, hemiS:0xdff4ff, hemiG:0xbda888, hemiI:1.05, ambI:0.6  },
  { h: 16.5, top:0x2b5cb8, mid:0x6fa8dc, horizon:0xffcc99, glow:0xfff1b8, fog:0xf0c8a0, fogD:0.0019, sunI:2.0,  sunC:0xffe8c0, hemiS:0x9ec9ff, hemiG:0xd8a070, hemiI:0.95, ambI:0.55 },
  { h: 18.7, top:0x2b5cb8, mid:0x6fa8dc, horizon:0xffb36b, glow:0xfff1b8, fog:0xf6b38a, fogD:0.0022, sunI:2.1,  sunC:0xffe0b0, hemiS:0x9ec9ff, hemiG:0xe0a070, hemiI:0.95, ambI:0.55 }, // golden hour (matches default)
  { h: 19.5, top:0x1a2f66, mid:0x5a4a78, horizon:0xff7a4a, glow:0xffa060, fog:0x8a5a58, fogD:0.0026, sunI:0.8,  sunC:0xff8844, hemiS:0x5a6fa0, hemiG:0x5a4038, hemiI:0.55, ambI:0.32 },
  { h: 20.5, top:0x0b1633, mid:0x182848, horizon:0x2a3450, glow:0x445577, fog:0x1a2438, fogD:0.0030, sunI:0.05, sunC:0x7788aa, hemiS:0x334466, hemiG:0x182030, hemiI:0.28, ambI:0.18 },
  { h: 24,   top:0x040814, mid:0x081225, horizon:0x0b1a2a, glow:0x1a2a44, fog:0x0a1420, fogD:0.0036, sunI:0.0,  sunC:0x8899bb, hemiS:0x223355, hemiG:0x0b1020, hemiI:0.18, ambI:0.12 },
];

const PRECOMP = KEYS.map(k => ({
  h: k.h,
  top: c(k.top), mid: c(k.mid), horizon: c(k.horizon), glow: c(k.glow),
  fog: c(k.fog), fogD: k.fogD, sunI: k.sunI, sunC: c(k.sunC),
  hemiS: c(k.hemiS), hemiG: c(k.hemiG), hemiI: k.hemiI, ambI: k.ambI,
}));

function sampleHour(h) {
  h = ((h % 24) + 24) % 24;
  let i = 0;
  for (; i < PRECOMP.length - 1; i++) {
    if (h >= PRECOMP[i].h && h <= PRECOMP[i + 1].h) break;
  }
  const a = PRECOMP[i], b = PRECOMP[Math.min(i + 1, PRECOMP.length - 1)];
  const span = (b.h - a.h) || 1;
  const t = clamp01((h - a.h) / span);
  const out = { h };
  const tmp = new THREE.Color();
  out.top = lerpColor(new THREE.Color(), a.top, b.top, t);
  out.mid = lerpColor(new THREE.Color(), a.mid, b.mid, t);
  out.horizon = lerpColor(new THREE.Color(), a.horizon, b.horizon, t);
  out.glow = lerpColor(new THREE.Color(), a.glow, b.glow, t);
  out.fog = lerpColor(new THREE.Color(), a.fog, b.fog, t);
  out.sunC = lerpColor(new THREE.Color(), a.sunC, b.sunC, t);
  out.hemiS = lerpColor(new THREE.Color(), a.hemiS, b.hemiS, t);
  out.hemiG = lerpColor(new THREE.Color(), a.hemiG, b.hemiG, t);
  out.fogD = lerp(a.fogD, b.fogD, t);
  out.sunI = lerp(a.sunI, b.sunI, t);
  out.hemiI = lerp(a.hemiI, b.hemiI, t);
  out.ambI = lerp(a.ambI, b.ambI, t);
  return out;
}

function sunDirForHour(h) {
  // rises ~6, sets ~20, peaks at 13
  const dayT = (h - 6) / 14; // 0 at 6, 1 at 20
  const angle = Math.PI * clamp01(dayT);
  const elev = Math.sin(angle); // 0..1..0 during day
  const az = lerp(-0.8, 0.8, clamp01(dayT));
  // at night keep below horizon
  let y = elev;
  if (h < 5.5 || h > 20.5) y = -0.2;
  const dir = new THREE.Vector3(Math.sin(az) * 0.9, y * 0.9 + 0.05, Math.cos(az) * 0.9).normalize();
  return dir;
}

function fmtTime(h) {
  h = ((h % 24) + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

export function createDayNight(ctx) {
  const { sky, scene, state } = ctx;
  let hour = 18.7; // golden hour default
  let frozen = false; // pinned by shots

  // optional ambient light for night visibility
  const amb = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(amb);

  function setTime(h, opts = {}) {
    hour = ((h % 24) + 24) % 24;
    if (opts.freeze !== undefined) frozen = !!opts.freeze;
    apply();
  }

  function apply() {
    const s = sampleHour(hour);
    const dir = sunDirForHour(hour);
    if (sky && sky.mesh && sky.mesh.material && sky.mesh.material.uniforms) {
      const u = sky.mesh.material.uniforms;
      if (u.top) u.top.value.copy(s.top);
      if (u.mid) u.mid.value.copy(s.mid);
      if (u.horizon) u.horizon.value.copy(s.horizon);
      if (u.glow) u.glow.value.copy(s.glow);
      if (u.sunDir) u.sunDir.value.copy(dir);
    }
    if (scene.fog) {
      if (scene.fog.color) scene.fog.color.copy(s.fog);
      if ('density' in scene.fog) scene.fog.density = s.fogD;
    }
    if (sky && sky.sun) {
      sky.sun.color.copy(s.sunC);
      sky.sun.intensity = s.sunI;
      // position sun far along dir relative to target/player
      const target = sky.sun.target ? sky.sun.target.position : new THREE.Vector3();
      sky.sun.position.set(target.x + dir.x * 420, Math.max(10, dir.y * 420 + 20), target.z + dir.z * 420);
      if (sky.sunMesh) {
        sky.sunMesh.position.copy(sky.sun.position).multiplyScalar(dir.y > 0 ? 2.0 : 1.0);
        sky.sunMesh.visible = dir.y > -0.05;
      }
    }
    if (sky && sky.hemi) {
      sky.hemi.color.copy(s.hemiS);
      sky.hemi.groundColor.copy(s.hemiG);
      sky.hemi.intensity = s.hemiI;
    }
    amb.intensity = s.ambI;
    // expose time for HUD/others
    if (state) {
      state.timeOfDayHours = hour;
      // keep state.timeOfDay as string clock for HUD unless a shot label is managing it;
      // shots pin via freeze and their own hudExtra, so updating base is fine.
      if (!state.timeOfDay || typeof state.timeOfDay === 'string' && /^\d{2}:\d{2}$/.test(state.timeOfDay)) {
        state.timeOfDay = fmtTime(hour);
      }
    }
  }

  // initialize at golden hour
  apply();

  function update(dt, st) {
    if (!frozen) {
      hour += (dt / 60); // 1 real sec = 1 game minute
      if (hour >= 24) hour -= 24;
    }
    // If a shot/system externally sets a pinned numeric time, respect freeze
    apply();
  }

  return { update, setTime, get hour() { return hour; }, get frozen() { return frozen; } };
}
