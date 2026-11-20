import * as THREE from 'three';

export function createBirdsAndClouds(ctx) {
  const { scene, sky } = ctx;
  const group = new THREE.Group();

  // Extra slowly drifting low-poly clouds (in addition to sky's clouds)
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xfff6ea, transparent: true, opacity: 0.42, roughness: 1, depthWrite: false });
  const clouds = [];
  for (let i = 0; i < 10; i++) {
    const c = new THREE.Group();
    const blobs = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < blobs; j++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(9 + Math.random() * 10, 8, 8), cloudMat);
      b.position.set((Math.random() - 0.5) * 34, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 18);
      b.scale.y = 0.5;
      c.add(b);
    }
    const a = Math.random() * Math.PI * 2;
    const r = 180 + Math.random() * 320;
    c.position.set(Math.cos(a) * r, 70 + Math.random() * 40, Math.sin(a) * r + 80);
    c.userData = { a, r, y: c.position.y, speed: 0.003 + Math.random() * 0.004, cx: 0, cz: 80 };
    group.add(c);
    clouds.push(c);
  }

  // Gulls circling over the beach (south side, z large positive)
  const gulls = [];
  const bodyGeo = new THREE.ConeGeometry(0.18, 1.2, 4);
  const wingGeo = new THREE.BoxGeometry(1.8, 0.04, 0.35);
  const gullMat = new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.8, side: THREE.DoubleSide });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, side: THREE.DoubleSide });
  const beachCx = -60, beachCz = 420;
  for (let i = 0; i < 7; i++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(bodyGeo, gullMat);
    body.rotation.x = Math.PI / 2;
    g.add(body);
    const lw = new THREE.Mesh(wingGeo, wingMat); lw.position.set(-0.9, 0, 0);
    const rw = new THREE.Mesh(wingGeo, wingMat); rw.position.set(0.9, 0, 0);
    g.add(lw, rw);
    const a = (i / 7) * Math.PI * 2;
    const r = 18 + Math.random() * 28;
    g.position.set(beachCx + Math.cos(a) * r, 22 + Math.random() * 12, beachCz + Math.sin(a) * r);
    g.userData = { a, r, y: g.position.y, speed: 0.25 + Math.random() * 0.2, phase: Math.random() * Math.PI * 2, cx: beachCx + (Math.random()-0.5)*40, cz: beachCz + (Math.random()-0.5)*30, lw, rw };
    group.add(g);
    gulls.push(g);
  }

  scene.add(group);

  let t = 0;
  function update(dt, state) {
    t += dt;
    // drift clouds slowly
    for (const c of clouds) {
      const d = c.userData;
      d.a += dt * d.speed;
      c.position.x = d.cx + Math.cos(d.a) * d.r;
      c.position.z = d.cz + Math.sin(d.a) * d.r * 0.85;
      c.position.y = d.y + Math.sin(t * 0.1 + d.a) * 1.5;
    }
    // circle gulls
    for (const g of gulls) {
      const d = g.userData;
      d.a += dt * d.speed / Math.max(10, d.r);
      g.position.x = d.cx + Math.cos(d.a) * d.r;
      g.position.z = d.cz + Math.sin(d.a) * d.r;
      g.position.y = d.y + Math.sin(t * 1.2 + d.phase) * 1.2;
      g.rotation.y = -d.a + Math.PI / 2;
      const flap = Math.sin(t * 6 + d.phase) * 0.35;
      d.lw.rotation.z = flap;
      d.rw.rotation.z = -flap;
    }
    // adjust cloud tint slightly by time of day if available
    if (state && state.timeOfDayHours != null) {
      const h = state.timeOfDayHours;
      const night = (h < 6 || h > 19.5);
      cloudMat.opacity = night ? 0.18 : 0.42;
    }
  }

  return { update, group };
}
