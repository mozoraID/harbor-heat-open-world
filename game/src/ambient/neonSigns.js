import * as THREE from 'three';

function collectEmissive(group, out, predicate) {
  if (!group) return;
  group.traverse((obj) => {
    if (!obj.isMesh) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      if (!m || !m.emissive) continue;
      if (!predicate || predicate(m, obj)) out.push({ mat: m, base: m.emissiveIntensity != null ? m.emissiveIntensity : 0.3, phase: Math.random() * Math.PI * 2, speed: 2 + Math.random() * 4 });
    }
  });
}

export function createNeonSigns(ctx) {
  const { city } = ctx;
  const signs = [];
  // shop signs: MeshStandardMaterial with emissive set to accent color and emissiveIntensity ~0.35, have a map (canvas sign)
  if (city && city.buildings && city.buildings.group) {
    collectEmissive(city.buildings.group, signs, (m) => !!m.map && m.emissiveIntensity >= 0.2 && m.emissiveIntensity <= 0.6);
  }
  // billboards: in props group, boards have map and emissiveIntensity ~0.2
  if (city && city.props && city.props.group) {
    collectEmissive(city.props.group, signs, (m) => !!m.map && m.emissiveIntensity >= 0.15 && m.emissiveIntensity <= 0.3);
  }

  let t = 0;
  function update(dt, state) {
    t += dt;
    const h = state && state.timeOfDayHours != null ? state.timeOfDayHours : 18.7;
    let on = 0;
    if (h >= 19.2 || h < 5.5) on = 1;
    else if (h >= 18.5) on = (h - 18.5) / 0.7;
    else if (h >= 5.0) on = 1 - (h - 5.0) / 0.5;
    on = Math.max(0, Math.min(1, on));

    for (const s of signs) {
      if (!s.mat) continue;
      if (on <= 0.01) {
        s.mat.emissiveIntensity = s.base * 0.2; // dim daytime
        continue;
      }
      // soft flicker
      const flick = 0.85 + 0.15 * Math.sin(t * s.speed + s.phase) + 0.05 * Math.sin(t * s.speed * 2.7 + s.phase);
      s.mat.emissiveIntensity = s.base * (0.6 + on * 1.6) * flick;
    }
  }
  return { update };
}
