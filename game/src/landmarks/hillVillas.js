import * as THREE from 'three';

export function addHillVillas(scene, layout, rng) {
  const rand = typeof rng === 'function' ? rng : () => Math.random();
  const group = new THREE.Group();

  // Cinder Hills (north-east, i>=8 j<=4 => x large positive, z negative)
  const baseY = 0;
  const wallMatColors = [0xf4efe6, 0xfff6e5, 0xe8f4ff, 0xfde2e4];
  const roofColors = [0xc44536, 0x6b4f2a, 0x555555, 0x2f4858];

  const villas = [
    { x: 260, z: -300, s: 1.0, ry: 0.2 },
    { x: 320, z: -260, s: 1.1, ry: -0.4 },
    { x: 360, z: -320, s: 0.9, ry: 0.6 },
    { x: 220, z: -240, s: 1.05, ry: -0.1 },
    { x: 300, z: -340, s: 0.95, ry: 0.9 },
  ];

  villas.forEach((v, i) => {
    const vg = new THREE.Group();
    const wall = new THREE.MeshLambertMaterial({ color: wallMatColors[i % wallMatColors.length] });
    const roof = new THREE.MeshLambertMaterial({ color: roofColors[i % roofColors.length] });

    // main house
    const body = new THREE.Mesh(new THREE.BoxGeometry(14 * v.s, 6.5, 10 * v.s), wall);
    body.position.y = 3.25;
    vg.add(body);
    const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(10.5 * v.s, 4.5, 4), roof);
    roofMesh.position.y = 8.7;
    roofMesh.rotation.y = Math.PI / 4;
    vg.add(roofMesh);

    // terrace
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(10 * v.s, 0.4, 6 * v.s), new THREE.MeshLambertMaterial({ color: 0xd9d2c2 }));
    terrace.position.set(0, 0.2, 8.5 * v.s);
    vg.add(terrace);
    // glass rail
    const rail = new THREE.Mesh(new THREE.BoxGeometry(10 * v.s, 1.0, 0.15), new THREE.MeshLambertMaterial({ color: 0xaed9ff, transparent: true, opacity: 0.5 }));
    rail.position.set(0, 0.9, 11.4 * v.s);
    vg.add(rail);

    // pool
    const pool = new THREE.Mesh(new THREE.BoxGeometry(6.5 * v.s, 0.5, 3.8 * v.s), new THREE.MeshLambertMaterial({ color: 0x3fc1ff }));
    pool.position.set(0.5 * v.s, 0.25, 8.2 * v.s);
    vg.add(pool);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(7.2 * v.s, 0.6, 4.5 * v.s), new THREE.MeshLambertMaterial({ color: 0xeae4d8 }));
    rim.position.set(0.5 * v.s, 0.15, 8.2 * v.s);
    vg.add(rim);

    // windows/door (simple)
    const winMat = new THREE.MeshBasicMaterial({ color: 0x8fd3ff });
    for (const wx of [-3.5, 0, 3.5]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.0), winMat);
      win.position.set(wx * v.s, 3.8, 5.05 * v.s);
      vg.add(win);
    }
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 3.2), new THREE.MeshLambertMaterial({ color: 0x5b3a21 }));
    door.position.set(0, 1.7, 5.05 * v.s);
    vg.add(door);

    vg.position.set(v.x, baseY, v.z);
    vg.rotation.y = v.ry;
    group.add(vg);
  });

  // a few hillside terrace pads/paths
  const padGeo = new THREE.BoxGeometry(8, 0.6, 8);
  const padMat = new THREE.MeshLambertMaterial({ color: 0xcdbb96 });
  const pads = new THREE.InstancedMesh(padGeo, padMat, 4);
  const dummy = new THREE.Object3D();
  [[240,-280],[290,-230],[350,-290],[330,-360]].forEach((p,idx)=>{
    dummy.position.set(p[0], 0.2, p[1]); dummy.rotation.set(0, rand()*0.5, 0); dummy.updateMatrix(); pads.setMatrixAt(idx, dummy.matrix);
  });
  pads.instanceMatrix.needsUpdate = true;
  group.add(pads);

  scene.add(group);
  return { update: () => {}, group };
}
