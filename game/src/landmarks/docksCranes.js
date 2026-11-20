import * as THREE from 'three';

export function addDocksCranes(scene, layout, rng) {
  const rand = typeof rng === 'function' ? rng : () => Math.random();
  const group = new THREE.Group();

  // Ferro Docks (north-west). Cranes 40m tall along dock edge.
  const baseZ = -300;
  const craneXs = [-320, -250, -180];
  const steelMat = new THREE.MeshLambertMaterial({ color: 0xf2b233 });
  const steelDark = new THREE.MeshLambertMaterial({ color: 0x444b55 });
  const cableMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

  craneXs.forEach((cx, idx) => {
    const crane = new THREE.Group();
    const legH = 40;
    const span = 28;
    const boom = 46;

    const legGeo = new THREE.BoxGeometry(1.8, legH, 1.8);
    const legs = new THREE.InstancedMesh(legGeo, steelMat, 4);
    const dummy = new THREE.Object3D();
    const offs = [[-span/2,-4.5],[span/2,-4.5],[-span/2,4.5],[span/2,4.5]];
    offs.forEach((o,i) => {
      dummy.position.set(o[0], legH/2, o[1]);
      dummy.rotation.set(0,0,0);
      dummy.updateMatrix(); legs.setMatrixAt(i, dummy.matrix);
    });
    legs.instanceMatrix.needsUpdate = true;
    crane.add(legs);

    // top beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 5, 2.6, 7), steelMat);
    beam.position.set(0, legH + 1.3, 0);
    crane.add(beam);

    // horizontal boom
    const boomMesh = new THREE.Mesh(new THREE.BoxGeometry(boom, 1.6, 2.8), steelMat);
    boomMesh.position.set(boom/2 - 8, legH + 3.8, 0);
    crane.add(boomMesh);
    const backBoom = new THREE.Mesh(new THREE.BoxGeometry(16, 1.4, 2.4), steelMat);
    backBoom.position.set(-span/2 - 5, legH + 3.5, 0);
    crane.add(backBoom);
    // support struts
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.8, 10, 0.8), steelMat);
    strut.position.set(6, legH + 8.5, 0);
    strut.rotation.z = -0.7;
    crane.add(strut);

    // cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 3.6), new THREE.MeshLambertMaterial({ color: 0x6fc3ff }));
    cabin.position.set(-3, legH - 2.5, 4.5);
    crane.add(cabin);

    // trolley and cable
    const trolley = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.3, 2.6), steelDark);
    trolley.position.set(10 + (idx * 4) % 14, legH + 2.6, 0);
    crane.add(trolley);
    const cable = new THREE.Mesh(new THREE.BoxGeometry(0.2, 18, 0.2), cableMat);
    cable.position.set(trolley.position.x, legH + 2.6 - 9, 0);
    crane.add(cable);
    const hook = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 1.4), steelDark);
    hook.position.set(trolley.position.x, legH + 2.6 - 18, 0);
    crane.add(hook);

    // rail base
    const rail = new THREE.Mesh(new THREE.BoxGeometry(span + 12, 1.2, 11), new THREE.MeshLambertMaterial({ color: 0x555555 }));
    rail.position.set(0, 0.6, 0);
    crane.add(rail);

    crane.position.set(cx, 0, baseZ);
    group.add(crane);
  });

  // Colourful container stacks (standard ~6m x 2.6m x 2.6m)
  const contGeo = new THREE.BoxGeometry(6, 2.6, 2.6);
  const contColors = [0xd94141, 0x2f6fed, 0x2ecc71, 0xf39c12, 0xffffff, 0x1abc9c, 0x9b59b6, 0xe67e22];
  const stacks = [
    { x: -340, z: -250, w: 5, d: 3, h: 4 },
    { x: -300, z: -235, w: 4, d: 2, h: 5 },
    { x: -270, z: -255, w: 4, d: 3, h: 3 },
    { x: -230, z: -240, w: 5, d: 2, h: 4 },
    { x: -190, z: -260, w: 3, d: 3, h: 3 },
    { x: -150, z: -245, w: 4, d: 2, h: 4 },
  ];
  let total = 0;
  for (const s of stacks) total += s.w * s.d * s.h;
  const containers = new THREE.InstancedMesh(contGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), total);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  let ci = 0;
  for (const s of stacks) {
    for (let ix = 0; ix < s.w; ix++) for (let iz = 0; iz < s.d; iz++) for (let iy = 0; iy < s.h; iy++) {
      const px = s.x + (ix - (s.w - 1) / 2) * 6.15;
      const pz = s.z + (iz - (s.d - 1) / 2) * 2.7;
      const py = 1.3 + iy * 2.62;
      dummy.position.set(px, py, pz);
      dummy.rotation.set(0, (rand() - 0.5) * 0.04, 0);
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
