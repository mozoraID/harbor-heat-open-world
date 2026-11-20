import * as THREE from 'three';

export function addHillVillas(scene, layout, rng) {
  const rand = typeof rng === 'function' ? rng : () => Math.random();
  const group = new THREE.Group();

  // Cinder Hills (north-east). Larger villas to read against 44m blocks.
  const baseY = 0;
  const wallMatColors = [0xf4efe6, 0xfff6e5, 0xe8f4ff, 0xfde2e4, 0xf0f0f0];
  const roofColors = [0xc44536, 0x6b4f2a, 0x555555, 0x2f4858, 0x8b3a3a];

  const villas = [
    { x: 240, z: -300, s: 1.1, ry: 0.25 },
    { x: 310, z: -250, s: 1.2, ry: -0.35 },
    { x: 360, z: -320, s: 1.0, ry: 0.55 },
    { x: 200, z: -240, s: 1.15, ry: -0.1 },
    { x: 280, z: -350, s: 1.05, ry: 0.8 },
    { x: 340, z: -200, s: 1.0, ry: -0.5 },
  ];

  villas.forEach((v, i) => {
    const vg = new THREE.Group();
    const wall = new THREE.MeshLambertMaterial({ color: wallMatColors[i % wallMatColors.length] });
    const roof = new THREE.MeshLambertMaterial({ color: roofColors[i % roofColors.length] });

    // main house (scaled up)
    const body = new THREE.Mesh(new THREE.BoxGeometry(18 * v.s, 8.0, 13 * v.s), wall);
    body.position.y = 4.0;
    vg.add(body);
    const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(13.5 * v.s, 5.5, 4), roof);
    roofMesh.position.y = 10.7;
    roofMesh.rotation.y = Math.PI / 4;
    vg.add(roofMesh);

    // terrace
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(12 * v.s, 0.5, 7.5 * v.s), new THREE.MeshLambertMaterial({ color: 0xd9d2c2 }));
    terrace.position.set(0, 0.25, 10.5 * v.s);
    vg.add(terrace);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(12 * v.s, 1.1, 0.18), new THREE.MeshLambertMaterial({ color: 0xaed9ff, transparent: true, opacity: 0.5 }));
    rail.position.set(0, 1.05, 14.1 * v.s);
    vg.add(rail);

    // pool
    const pool = new THREE.Mesh(new THREE.BoxGeometry(7.5 * v.s, 0.5, 4.2 * v.s), new THREE.MeshLambertMaterial({ color: 0x3fc1ff }));
    pool.position.set(0.5 * v.s, 0.28, 10.2 * v.s);
    vg.add(pool);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(8.3 * v.s, 0.65, 5.0 * v.s), new THREE.MeshLambertMaterial({ color: 0xeae4d8 }));
    rim.position.set(0.5 * v.s, 0.18, 10.2 * v.s);
    vg.add(rim);

    // windows/door
    const winMat = new THREE.MeshBasicMaterial({ color: 0x8fd3ff });
    for (const wx of [-4.5, 0, 4.5]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.4), winMat);
      win.position.set(wx * v.s, 4.6, 6.55 * v.s);
      vg.add(win);
    }
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.8), new THREE.MeshLambertMaterial({ color: 0x5b3a21 }));
    door.position.set(0, 2.0, 6.55 * v.s);
    vg.add(door);

    vg.position.set(v.x, baseY, v.z);
    vg.rotation.y = v.ry;
    group.add(vg);
  });

  // hillside terrace pads
  const padGeo = new THREE.BoxGeometry(10, 0.7, 10);
  const padMat = new THREE.MeshLambertMaterial({ color: 0xcdbb96 });
  const pads = new THREE.InstancedMesh(padGeo, padMat, 5);
  const dummy = new THREE.Object3D();
  [[220,-280],[270,-220],[330,-270],[300,-340],[360,-230]].forEach((p,idx)=>{
    dummy.position.set(p[0], 0.25, p[1]); dummy.rotation.set(0, rand()*0.5, 0); dummy.updateMatrix(); pads.setMatrixAt(idx, dummy.matrix);
  });
  pads.instanceMatrix.needsUpdate = true;
  group.add(pads);

  scene.add(group);
  return { update: () => {}, group };
}
