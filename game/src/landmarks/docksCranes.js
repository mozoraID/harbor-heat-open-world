import * as THREE from 'three';

export function addDocksCranes(scene, layout, rng) {
  const rand = typeof rng === 'function' ? rng : () => Math.random();
  const group = new THREE.Group();

  // Ferro Docks area (north-west). Place cranes along waterfront side.
  const baseZ = -260;
  const craneXs = [-360, -270, -180];
  const steelMat = new THREE.MeshLambertMaterial({ color: 0xf2b233 });
  const steelDark = new THREE.MeshLambertMaterial({ color: 0x444b55 });
  const cableMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

  craneXs.forEach((cx, idx) => {
    const crane = new THREE.Group();
    const legH = 34;
    const span = 26;
    const boom = 38;

    // legs
    const legGeo = new THREE.BoxGeometry(1.6, legH, 1.6);
    const legs = new THREE.InstancedMesh(legGeo, steelMat, 4);
    const dummy = new THREE.Object3D();
    const offs = [[-span/2,-4],[span/2,-4],[-span/2,4],[span/2,4]];
    offs.forEach((o,i) => {
      dummy.position.set(o[0], legH/2, o[1]);
      dummy.rotation.set(0,0,0);
      dummy.updateMatrix(); legs.setMatrixAt(i, dummy.matrix);
    });
    legs.instanceMatrix.needsUpdate = true;
    crane.add(legs);

    // top beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 4, 2.2, 6), steelMat);
    beam.position.set(0, legH + 1.1, 0);
    crane.add(beam);

    // horizontal boom
    const boomMesh = new THREE.Mesh(new THREE.BoxGeometry(boom, 1.4, 2.4), steelMat);
    boomMesh.position.set(boom/2 - 6, legH + 3.2, 0);
    crane.add(boomMesh);
    const backBoom = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 2.0), steelMat);
    backBoom.position.set(-span/2 - 4, legH + 3.0, 0);
    crane.add(backBoom);

    // cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 3.2), new THREE.MeshLambertMaterial({ color: 0x6fc3ff }));
    cabin.position.set(-2, legH - 2, 3.5);
    crane.add(cabin);

    // trolley and cable
    const trolley = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 2.2), steelDark);
    trolley.position.set(8 + (idx * 3) % 10, legH + 2.1, 0);
    crane.add(trolley);
    const cable = new THREE.Mesh(new THREE.BoxGeometry(0.18, 14, 0.18), cableMat);
    cable.position.set(trolley.position.x, legH + 2.1 - 7, 0);
    crane.add(cable);
    const hook = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), steelDark);
    hook.position.set(trolley.position.x, legH + 2.1 - 14, 0);
    crane.add(hook);

    // rail base
    const rail = new THREE.Mesh(new THREE.BoxGeometry(span + 10, 1.0, 10), new THREE.MeshLambertMaterial({ color: 0x555555 }));
    rail.position.set(0, 0.5, 0);
    crane.add(rail);

    crane.position.set(cx, 0, baseZ);
    group.add(crane);
  });

  // Colourful container stacks
  const contGeo = new THREE.BoxGeometry(6, 2.6, 2.6);
  const contColors = [0xd94141, 0x2f6fed, 0x2ecc71, 0xf39c12, 0xffffff, 0x1abc9c, 0x9b59b6];
  const stacks = [
    { x: -320, z: -220, w: 4, d: 3, h: 3 },
    { x: -300, z: -235, w: 3, d: 2, h: 4 },
    { x: -240, z: -220, w: 4, d: 3, h: 2 },
    { x: -210, z: -238, w: 3, d: 2, h: 3 },
    { x: -150, z: -225, w: 3, d: 3, h: 3 },
  ];
  let total = 0;
  for (const s of stacks) total += s.w * s.d * s.h;
  const containers = new THREE.InstancedMesh(contGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), total);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  let ci = 0;
  for (const s of stacks) {
    for (let ix = 0; ix < s.w; ix++) for (let iz = 0; iz < s.d; iz++) for (let iy = 0; iy < s.h; iy++) {
      const px = s.x + (ix - (s.w - 1) / 2) * 6.1;
      const pz = s.z + (iz - (s.d - 1) / 2) * 2.7;
      const py = 1.3 + iy * 2.65;
      dummy.position.set(px, py, pz);
      dummy.rotation.set(0, (rand() - 0.5) * 0.05, 0);
      dummy.updateMatrix();
      containers.setMatrixAt(ci, dummy.matrix);
      color.setHex(contColors[Math.floor(rand() * contColors.length)]);
      containers.setColorAt(ci, color);
      ci++;
    }
  }
  containers.instanceMatrix.needsUpdate = true;
  if (containers.instanceColor) containers.instanceColor.needsUpdate = true;
  group.add(containers);

  scene.add(group);
  return { update: () => {}, group };
}
