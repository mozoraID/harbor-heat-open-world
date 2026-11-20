// Creates a dramatic burning-car explosion with fireball, smoke, and debris.
import * as THREE from 'three';

export function createCarExplosion(scene, x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const add = (m) => { group.add(m); return m; };

  const core = add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98, blending: THREE.AdditiveBlending, depthWrite: false })));
  core.position.y = 1.2;
  const fire1 = add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), new THREE.MeshBasicMaterial({ color: 0xfff066, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })));
  fire1.position.y = 1.5;
  const fire2 = add(new THREE.Mesh(new THREE.IcosahedronGeometry(3.1, 1), new THREE.MeshBasicMaterial({ color: 0xff8a1f, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })));
  fire2.position.y = 1.8;
  const fire3 = add(new THREE.Mesh(new THREE.IcosahedronGeometry(3.8, 1), new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })));
  fire3.position.y = 2.0;

  const smokes = [];
  const smokeCount = 10;
  for (let i = 0; i < smokeCount; i++) {
    const r = 0.55 + Math.random() * 1.05;
    const grey = 0.12 + Math.random() * 0.38;
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(grey, grey, grey), transparent: true, opacity: 0.18 + Math.random() * 0.28, roughness: 1, depthWrite: false });
    const s = add(new THREE.Mesh(new THREE.SphereGeometry(r, 10, 10), mat));
    s.position.set((Math.random() - 0.5) * 1.6, 1.6 + Math.random() * 2.6, (Math.random() - 0.5) * 1.6);
    smokes.push({
      m: s,
      vx: (Math.random() - 0.5) * 0.9,
      vy: 0.45 + Math.random() * 1.1,
      vz: (Math.random() - 0.5) * 0.9,
      grow: 0.18 + Math.random() * 0.35,
      base: mat.opacity,
      drag: 0.97 + Math.random() * 0.02,
      swirl: Math.random() * Math.PI * 2,
    });
  }

  const sparks = [];
  const sparkGeo = new THREE.SphereGeometry(0.05, 6, 6);
  const emberCount = 22;
  for (let i = 0; i < emberCount; i++) {
    const hot = Math.random();
    const color = hot > 0.6 ? 0xffee88 : (hot > 0.3 ? 0xffaa33 : 0xff6622);
    const sp = add(new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })));
    sp.position.set((Math.random() - 0.5) * 0.6, 1.0 + Math.random() * 0.8, (Math.random() - 0.5) * 0.6);
    sparks.push({
      m: sp,
      vx: (Math.random() - 0.5) * 5.5,
      vy: 1.8 + Math.random() * 6.5,
      vz: (Math.random() - 0.5) * 5.5,
      t: 0.8 + Math.random() * 1.6,
      max: 1.0,
      flicker: Math.random() * Math.PI * 2,
    });
    sparks[sparks.length - 1].max = sparks[sparks.length - 1].t;
  }

  const debris = [];
  const debMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9, metalness: 0.2 });
  for (let i = 0; i < 10; i++) {
    const d = add(new THREE.Mesh(new THREE.BoxGeometry(0.25 + Math.random() * 0.4, 0.08 + Math.random() * 0.18, 0.25 + Math.random() * 0.4), debMat));
    d.position.set((Math.random() - 0.5) * 1.5, 0.8 + Math.random() * 0.6, (Math.random() - 0.5) * 1.5);
    debris.push({ m: d, vx: (Math.random() - 0.5) * 5, vy: 1.5 + Math.random() * 3.5, vz: (Math.random() - 0.5) * 5, rx: (Math.random() - 0.5) * 6, rz: (Math.random() - 0.5) * 6, ground: false });
  }

  const light = new THREE.PointLight(0xff8a2a, 16, 45, 2);
  light.position.set(0, 2.0, 0);
  group.add(light);

  scene.add(group);
  return {
    group, fire: fire1, smoke: smokes[0] ? smokes[0].m : fire2, core, fire2, fire3, light, sparks, smokes, debris, t: 0,
    update(dt) {
      this.t += dt;
      const pulse = 1 + Math.sin(this.t * 10) * 0.08;
      core.scale.setScalar(pulse * (1.1 + Math.sin(this.t * 13) * 0.1));
      fire1.scale.setScalar(1.2 + Math.sin(this.t * 7) * 0.12);
      fire2.scale.setScalar(1.15 + Math.sin(this.t * 5.5 + 1) * 0.1);
      fire3.scale.setScalar(1.1 + Math.sin(this.t * 4.5 + 2) * 0.12);
      core.material.opacity = 0.7 + Math.sin(this.t * 12) * 0.25;
      fire1.material.opacity = 0.8 + Math.sin(this.t * 9) * 0.15;
      fire2.material.opacity = 0.65 + Math.sin(this.t * 6) * 0.15;
      light.intensity = 10 + Math.sin(this.t * 11) * 5;
      for (const s of smokes) {
        s.swirl += dt * 0.8;
        s.vx *= s.drag; s.vz *= s.drag;
        s.m.position.x += (s.vx + Math.sin(s.swirl + s.m.position.y) * 0.12) * dt;
        s.m.position.y += s.vy * dt;
        s.m.position.z += (s.vz + Math.cos(s.swirl * 0.9) * 0.12) * dt;
        s.m.scale.multiplyScalar(1 + dt * s.grow);
        const fade = Math.max(0, s.base - this.t * 0.045 - s.m.position.y * 0.006);
        s.m.material.opacity = fade;
      }
      for (const sp of sparks) {
        sp.t -= dt; if (sp.t <= 0) { sp.m.visible = false; continue; }
        sp.flicker += dt * 18;
        sp.vy -= 7.5 * dt;
        sp.vx *= 0.985; sp.vz *= 0.985;
        sp.m.position.x += sp.vx * dt;
        sp.m.position.y += sp.vy * dt;
        sp.m.position.z += sp.vz * dt;
        if (sp.m.position.y < 0.05) { sp.m.position.y = 0.05; sp.vy *= -0.2; sp.vx *= 0.4; sp.vz *= 0.4; }
        const k = Math.max(0, sp.t / sp.max);
        sp.m.material.opacity = k * (0.55 + 0.45 * Math.abs(Math.sin(sp.flicker)));
        sp.m.scale.setScalar(0.6 + k * 0.8);
      }
      for (const d of debris) {
        if (d.ground) continue;
        d.vy -= 10 * dt; d.m.position.x += d.vx * dt; d.m.position.y += d.vy * dt; d.m.position.z += d.vz * dt;
        d.m.rotation.x += d.rx * dt; d.m.rotation.z += d.rz * dt;
        if (d.m.position.y < 0.08) { d.m.position.y = 0.08; d.ground = true; }
      }
    },
  };
}
