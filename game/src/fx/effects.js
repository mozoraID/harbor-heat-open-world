// Simple particle effects for vehicle damage sparks and smoke.
import * as THREE from 'three';

export function createEffects(scene) {
  const sparks = [];
  const smokes = [];
  const sparkGeo = new THREE.SphereGeometry(0.07, 6, 6);
  const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffcc55 });
  const smokeMat = new THREE.MeshStandardMaterial({ color: 0x666, transparent: true, opacity: 0.45, roughness: 1 });

  function spark(x, y, z) {
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(sparkGeo, sparkMat.clone());
      m.position.set(x, y, z);
      scene.add(m);
      sparks.push({ m, vx: (Math.random() - 0.5) * 4, vy: 1 + Math.random() * 3, vz: (Math.random() - 0.5) * 4, t: 0.4 + Math.random() * 0.3 });
    }
  }

  function smoke(x, y, z, scale = 1) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.5 * scale, 8, 8), smokeMat.clone());
    m.position.set(x, y, z);
    scene.add(m);
    smokes.push({ m, vy: 0.6 + Math.random() * 0.5, t: 1.2 + Math.random() * 0.8, s: scale });
  }

  function update(dt) {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.t -= dt;
      p.vy -= 9 * dt;
      p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
      if (p.t <= 0 || p.m.position.y < 0) { scene.remove(p.m); sparks.splice(i, 1); }
    }
    for (let i = smokes.length - 1; i >= 0; i--) {
      const p = smokes[i];
      p.t -= dt;
      p.m.position.y += p.vy * dt;
      p.m.scale.multiplyScalar(1 + dt * 0.6);
      p.m.material.opacity = Math.max(0, p.t * 0.3);
      if (p.t <= 0) { scene.remove(p.m); smokes.splice(i, 1); }
    }
  }

  return { spark, smoke, update };
}