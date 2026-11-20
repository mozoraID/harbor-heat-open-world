// Simple particle effects for vehicle damage sparks, smoke, and explosions.
import * as THREE from 'three';

export function createEffects(scene) {
  const sparks = [];
  const smokes = [];
  const blasts = [];
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

  function explode(x, y = 1.2, z) {
    const fire = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 14), new THREE.MeshStandardMaterial({ color: 0xffcc55, emissive: 0xff6600, emissiveIntensity: 1.8, transparent: true, opacity: 0.95 }));
    fire.position.set(x, y, z);
    const sm = new THREE.Mesh(new THREE.SphereGeometry(3.0, 12, 12), new THREE.MeshStandardMaterial({ color: 0x333, transparent: true, opacity: 0.6 }));
    sm.position.set(x, y + 1.8, z);
    const light = new THREE.PointLight(0xff7a1a, 10, 35, 2);
    light.position.set(x, y + 1.0, z);
    scene.add(fire, sm, light);
    blasts.push({ fire, sm, light, t: 2.5, max: 2.5 });
    spark(x, y, z);
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
    for (let i = blasts.length - 1; i >= 0; i--) {
      const b = blasts[i];
      b.t -= dt;
      const k = 1 - b.t / b.max;
      b.fire.scale.setScalar(1 + k * 1.2);
      b.fire.material.opacity = Math.max(0, b.t / b.max);
      b.sm.position.y += dt * 0.8;
      b.sm.scale.setScalar(1 + k * 0.8);
      b.sm.material.opacity = Math.max(0, b.t / b.max * 0.6);
      b.light.intensity = Math.max(0, (b.t / b.max) * 10);
      if (b.t <= 0) { scene.remove(b.fire); scene.remove(b.sm); scene.remove(b.light); blasts.splice(i, 1); }
    }
  }

  return { spark, smoke, explode, update };
}