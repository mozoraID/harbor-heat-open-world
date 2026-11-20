import * as THREE from 'three';

function collectLampHeads(group, out) {
  if (!group) return;
  group.traverse((obj) => {
    if (!obj.isMesh) return;
    const mat = obj.material;
    if (!mat) return;
    // lamp head in props.js: sphere with emissive 0xffd978 and color 0xfff3c8
    const em = mat.emissive;
    if (em && em.getHex && em.getHex() === 0xffd978) {
      out.push({ mesh: obj, mat, base: mat.emissiveIntensity != null ? mat.emissiveIntensity : 0.8 });
    }
  });
}

function collectWindowMats(group, out) {
  if (!group) return;
  group.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      if (!m || !m.map) continue;
      // building textures have lit window pixels; boost emissiveMap/emissive at night
      // Identify by map usage on building boxes (standard materials with map)
      if (m.isMeshStandardMaterial && m.map && !m.emissiveMap && m.roughness !== undefined) {
        // heuristic: buildings use map + white color and roughness 0.25 or 0.72
        if (m.color && m.color.r === 1 && m.color.g === 1 && m.color.b === 1) {
          out.push({ mat: m });
        }
      }
    }
  });
}

export function createStreetLights(ctx) {
  const { scene, city } = ctx;
  const lamps = [];
  const windows = [];
  if (city && city.props && city.props.group) collectLampHeads(city.props.group, lamps);
  if (city && city.buildings && city.buildings.group) collectWindowMats(city.buildings.group, windows);

  // pooled point lights near player for sidewalk pools
  const poolCount = 6;
  const pools = [];
  for (let i = 0; i < poolCount; i++) {
    const pl = new THREE.PointLight(0xffd88a, 0, 14, 2);
    pl.position.set(0, -100, 0);
    scene.add(pl);
    pools.push(pl);
  }

  function update(dt, state) {
    const h = state && state.timeOfDayHours != null ? state.timeOfDayHours : 18.7;
    // on after 19:00, fade around dusk
    let on = 0;
    if (h >= 19.5 || h < 5.5) on = 1;
    else if (h >= 18.5) on = (h - 18.5) / 1.0; // fade in 18.5-19.5
    else if (h >= 5.0) on = 1 - (h - 5.0) / 0.5; // fade out dawn
    else on = 0;
    on = Math.max(0, Math.min(1, on));

    for (const l of lamps) {
      if (l.mat && 'emissiveIntensity' in l.mat) {
        l.mat.emissiveIntensity = 0.05 + on * 1.4;
      }
    }
    for (const w of windows) {
      const m = w.mat;
      if (!m) continue;
      // give lit windows a glow by using emissive + emissiveMap = map
      if (on > 0.01) {
        if (!m.emissiveMap && m.map) m.emissiveMap = m.map;
        m.emissive.setRGB(1, 0.95, 0.8);
        m.emissiveIntensity = on * 0.9;
      } else {
        m.emissiveIntensity = 0;
      }
    }

    // position a few pooled lights near player at nearest lamps
    const px = state && state.player ? state.player.x : 0;
    const pz = state && state.player ? state.player.z : 0;
    if (on > 0.05 && lamps.length) {
      // pick closest lamps (simple scan each frame; lamp count moderate)
      const scored = [];
      for (const l of lamps) {
        const p = l.mesh.getWorldPosition(_v);
        const dx = p.x - px, dz = p.z - pz;
        const d2 = dx * dx + dz * dz;
        if (d2 < 60 * 60) scored.push({ d2, p: p.clone() });
      }
      scored.sort((a, b) => a.d2 - b.d2);
      for (let i = 0; i < poolCount; i++) {
        const pl = pools[i];
        if (i < scored.length) {
          pl.position.set(scored[i].p.x, scored[i].p.y - 1.0, scored[i].p.z);
          pl.intensity = on * 0.9;
        } else {
          pl.intensity = 0;
        }
      }
    } else {
      for (const pl of pools) pl.intensity = 0;
    }
  }

  const _v = new THREE.Vector3();
  return { update };
}
