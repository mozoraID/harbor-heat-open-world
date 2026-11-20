import * as THREE from 'three';

export function addBeachLife(scene, layout, rng) {
  const rand = typeof rng === 'function' ? rng : () => Math.random();
  const group = new THREE.Group();

  // Marigold Beach along whole south edge (z ~ 330-420, ocean beyond)
  const sandY = 0.05;

  // Boardwalk spanning most of beach width
  const boardZ = 348;
  const boardLen = 720;
  const boardW = 10;
  const woodMat = new THREE.MeshLambertMaterial({ color: 0xb07a45 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(boardLen, 0.45, boardW), woodMat);
  board.position.set(0, 0.4, boardZ);
  group.add(board);
  const plankLineGeo = new THREE.BoxGeometry(boardLen, 0.47, 0.18);
  for (const off of [-3.6, 0, 3.6]) {
    const l = new THREE.Mesh(plankLineGeo, new THREE.MeshLambertMaterial({ color: 0x9a6838 }));
    l.position.set(0, 0.41, boardZ + off);
    group.add(l);
  }

  // Food stalls along boardwalk (spread across whole beach)
  const stallColors = [0xff6b6b, 0x4bcffa, 0xffdd59, 0x34e7e4, 0xff9f1a, 0xc56cf0];
  const stallXs = [-300, -180, -60, 60, 180, 300];
  stallXs.forEach((sx, i) => {
    const stall = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(10, 3.4, 6), new THREE.MeshLambertMaterial({ color: stallColors[i % stallColors.length] }));
    base.position.y = 1.7;
    stall.add(base);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.4, 2.2), new THREE.MeshLambertMaterial({ color: 0xf4f1e6 }));
    counter.position.set(0, 2.5, 3.6);
    stall.add(counter);
    const awning = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.3, 4.2), new THREE.MeshLambertMaterial({ color: i % 2 ? 0xffffff : 0xff4757 }));
    awning.position.set(0, 3.8, 3.2);
    awning.rotation.x = -0.25;
    stall.add(awning);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(6, 1.4, 0.3), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    sign.position.set(0, 4.6, 1.0);
    stall.add(sign);
    stall.position.set(sx, 0.62, boardZ - 1.8);
    stall.rotation.y = Math.PI;
    group.add(stall);
  });

  // Lifeguard towers ~4m
  const towerXs = [-280, -140, 0, 140, 280];
  towerXs.forEach((tx) => {
    const t = new THREE.Group();
    const legGeo = new THREE.BoxGeometry(0.28, 3.2, 0.28);
    const legs = new THREE.InstancedMesh(legGeo, new THREE.MeshLambertMaterial({ color: 0xc49a6c }), 4);
    const dummy = new THREE.Object3D();
    [[-1.1,-1.1],[1.1,-1.1],[-1.1,1.1],[1.1,1.1]].forEach((o,idx)=>{
      dummy.position.set(o[0], 1.6, o[1]); dummy.rotation.set(0,0,0); dummy.updateMatrix(); legs.setMatrixAt(idx,dummy.matrix);
    });
    legs.instanceMatrix.needsUpdate = true;
    t.add(legs);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.0, 2.6), new THREE.MeshLambertMaterial({ color: 0xf2f2f2 }));
    cabin.position.y = 4.0;
    t.add(cabin);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.35, 3.4), new THREE.MeshLambertMaterial({ color: 0xff5e57 }));
    roof.position.y = 5.2;
    roof.rotation.x = -0.12;
    t.add(roof);
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 3.2), new THREE.MeshLambertMaterial({ color: 0xc49a6c }));
    ramp.position.set(0, 1.4, 2.6);
    ramp.rotation.x = -0.55;
    t.add(ramp);
    t.position.set(tx, sandY, 372);
    group.add(t);
  });

  // Umbrellas and towels along whole beach
  const umbrellaCount = 36;
  const poleGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.2, 6);
  const canopyGeo = new THREE.ConeGeometry(1.5, 0.9, 8);
  const towelGeo = new THREE.BoxGeometry(1.5, 0.05, 2.2);
  const umbPoles = new THREE.InstancedMesh(poleGeo, new THREE.MeshLambertMaterial({ color: 0xdedede }), umbrellaCount);
  const umbCanopies = new THREE.InstancedMesh(canopyGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), umbrellaCount);
  const towels = new THREE.InstancedMesh(towelGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), umbrellaCount);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const umbColors = [0xff5e57, 0x4bcffa, 0xffdd59, 0x34e7e4, 0xc56cf0, 0xffffff, 0xff9f1a];
  const towelColors = [0x1abc9c, 0xe74c3c, 0xf1c40f, 0x3498db, 0xe67e22, 0x9b59b6];
  for (let i = 0; i < umbrellaCount; i++) {
    const ux = -320 + (i % 12) * 58 + (rand() - 0.5) * 14;
    const uz = 382 + Math.floor(i / 12) * 16 + (rand() - 0.5) * 6;
    const ry = rand() * Math.PI * 2;
    dummy.position.set(ux, 1.15, uz); dummy.rotation.set(0, ry, 0.04); dummy.updateMatrix();
    umbPoles.setMatrixAt(i, dummy.matrix);
    dummy.position.set(ux, 2.3, uz); dummy.rotation.set(0, ry, 0); dummy.updateMatrix();
    umbCanopies.setMatrixAt(i, dummy.matrix);
    color.setHex(umbColors[i % umbColors.length]); umbCanopies.setColorAt(i, color);
    dummy.position.set(ux + 1.1, 0.08, uz + 0.5); dummy.rotation.set(0, ry + 0.3, 0); dummy.updateMatrix();
    towels.setMatrixAt(i, dummy.matrix);
    color.setHex(towelColors[(i + 2) % towelColors.length]); towels.setColorAt(i, color);
  }
  umbPoles.instanceMatrix.needsUpdate = true;
  umbCanopies.instanceMatrix.needsUpdate = true; if (umbCanopies.instanceColor) umbCanopies.instanceColor.needsUpdate = true;
  towels.instanceMatrix.needsUpdate = true; if (towels.instanceColor) towels.instanceColor.needsUpdate = true;
  group.add(umbPoles, umbCanopies, towels);

  // Volleyball nets along beach
  const netXs = [-200, 80, 240];
  netXs.forEach((vx) => {
    const net = new THREE.Group();
    const vz = 398;
    const poleVGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.8, 6);
    for (const side of [-1, 1]) {
      const p = new THREE.Mesh(poleVGeo, new THREE.MeshLambertMaterial({ color: 0xdddddd }));
      p.position.set(side * 4, 1.4, 0);
      net.add(p);
    }
    const netMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 1.0),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    netMesh.position.set(0, 2.0, 0);
    net.add(netMesh);
    const tape = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    tape.position.set(0, 2.5, 0);
    net.add(tape);
    net.position.set(vx, 0, vz);
    group.add(net);
  });

  scene.add(group);
  return { update: () => {}, group };
}
