import * as THREE from 'three';

export function addBeachLife(scene, layout, rng) {
  const rand = typeof rng === 'function' ? rng : () => Math.random();
  const group = new THREE.Group();

  // Marigold Beach along south edge (large +z). Sand band roughly z 330..420, ocean beyond ~430+
  const sandY = 0.05;

  // Boardwalk with food stalls
  const boardZ = 345;
  const boardLen = 520;
  const boardW = 10;
  const woodMat = new THREE.MeshLambertMaterial({ color: 0xb07a45 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(boardLen, 0.4, boardW), woodMat);
  board.position.set(0, 0.35, boardZ);
  group.add(board);
  // board planks detail strips (a few)
  const plankLineGeo = new THREE.BoxGeometry(boardLen, 0.42, 0.15);
  for (const off of [-3.5, 0, 3.5]) {
    const l = new THREE.Mesh(plankLineGeo, new THREE.MeshLambertMaterial({ color: 0x9a6838 }));
    l.position.set(0, 0.36, boardZ + off);
    group.add(l);
  }

  // Food stalls along boardwalk
  const stallColors = [0xff6b6b, 0x4bcffa, 0xffdd59, 0x34e7e4, 0xff9f1a];
  const stallXs = [-180, -90, 0, 90, 180];
  stallXs.forEach((sx, i) => {
    const stall = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(10, 3.2, 6), new THREE.MeshLambertMaterial({ color: stallColors[i % stallColors.length] }));
    base.position.y = 1.6;
    stall.add(base);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.4, 2.2), new THREE.MeshLambertMaterial({ color: 0xf4f1e6 }));
    counter.position.set(0, 2.4, 3.6);
    stall.add(counter);
    const awning = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.3, 4.2), new THREE.MeshLambertMaterial({ color: i % 2 ? 0xffffff : 0xff4757 }));
    awning.position.set(0, 3.6, 3.2);
    awning.rotation.x = -0.25;
    stall.add(awning);
    // sign board
    const sign = new THREE.Mesh(new THREE.BoxGeometry(6, 1.4, 0.3), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    sign.position.set(0, 4.4, 1.0);
    stall.add(sign);
    stall.position.set(sx, 0.55, boardZ - 1.5);
    stall.rotation.y = Math.PI; // face ocean side
    group.add(stall);
  });

  // Lifeguard towers
  const towerMat = new THREE.MeshLambertMaterial({ color: 0xf2f2f2 });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xff5e57 });
  const towerXs = [-140, 60, 220];
  towerXs.forEach((tx) => {
    const t = new THREE.Group();
    // legs
    const legGeo = new THREE.BoxGeometry(0.3, 4.5, 0.3);
    const legs = new THREE.InstancedMesh(legGeo, new THREE.MeshLambertMaterial({ color: 0xc49a6c }), 4);
    const dummy = new THREE.Object3D();
    [[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]].forEach((o,idx)=>{
      dummy.position.set(o[0], 2.25, o[1]); dummy.rotation.set(0,0,0); dummy.updateMatrix(); legs.setMatrixAt(idx,dummy.matrix);
    });
    legs.instanceMatrix.needsUpdate = true;
    t.add(legs);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 3.0), towerMat);
    cabin.position.y = 5.2;
    t.add(cabin);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 3.8), roofMat);
    roof.position.y = 6.5;
    roof.rotation.x = -0.1;
    t.add(roof);
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 4.0), new THREE.MeshLambertMaterial({ color: 0xc49a6c }));
    ramp.position.set(0, 2.0, 3.0);
    ramp.rotation.x = -0.6;
    t.add(ramp);
    t.position.set(tx, sandY, 370);
    group.add(t);
  });

  // Umbrellas and towels (instanced)
  const umbrellaCount = 18;
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6);
  const canopyGeo = new THREE.ConeGeometry(1.6, 1.0, 8);
  const towelGeo = new THREE.BoxGeometry(1.6, 0.05, 2.4);
  const umbPoles = new THREE.InstancedMesh(poleGeo, new THREE.MeshLambertMaterial({ color: 0xdedede }), umbrellaCount);
  const umbCanopies = new THREE.InstancedMesh(canopyGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), umbrellaCount);
  const towels = new THREE.InstancedMesh(towelGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), umbrellaCount);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const umbColors = [0xff5e57, 0x4bcffa, 0xffdd59, 0x34e7e4, 0xc56cf0, 0xffffff];
  const towelColors = [0x1abc9c, 0xe74c3c, 0xf1c40f, 0x3498db, 0xe67e22, 0x9b59b6];
  for (let i = 0; i < umbrellaCount; i++) {
    const ux = -240 + (i % 9) * 60 + (rand() - 0.5) * 18;
    const uz = 385 + Math.floor(i / 9) * 18 + (rand() - 0.5) * 8;
    const ry = rand() * Math.PI * 2;
    dummy.position.set(ux, 1.25, uz); dummy.rotation.set(0, ry, 0.05); dummy.updateMatrix();
    umbPoles.setMatrixAt(i, dummy.matrix);
    dummy.position.set(ux, 2.5, uz); dummy.rotation.set(0, ry, 0); dummy.updateMatrix();
    umbCanopies.setMatrixAt(i, dummy.matrix);
    color.setHex(umbColors[i % umbColors.length]); umbCanopies.setColorAt(i, color);
    dummy.position.set(ux + 1.2, 0.08, uz + 0.6); dummy.rotation.set(0, ry + 0.3, 0); dummy.updateMatrix();
    towels.setMatrixAt(i, dummy.matrix);
    color.setHex(towelColors[(i + 2) % towelColors.length]); towels.setColorAt(i, color);
  }
  umbPoles.instanceMatrix.needsUpdate = true;
  umbCanopies.instanceMatrix.needsUpdate = true; if (umbCanopies.instanceColor) umbCanopies.instanceColor.needsUpdate = true;
  towels.instanceMatrix.needsUpdate = true; if (towels.instanceColor) towels.instanceColor.needsUpdate = true;
  group.add(umbPoles, umbCanopies, towels);

  // Beach volleyball net
  const net = new THREE.Group();
  const vx = -40, vz = 400;
  const poleVGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 6);
  for (const side of [-1, 1]) {
    const p = new THREE.Mesh(poleVGeo, new THREE.MeshLambertMaterial({ color: 0xdddddd }));
    p.position.set(vx + side * 4, 1.6, vz);
    net.add(p);
  }
  const netMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 1.2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, wireframe: false })
  );
  netMesh.position.set(vx, 2.2, vz);
  net.add(netMesh);
  // top tape
  const tape = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  tape.position.set(vx, 2.8, vz);
  net.add(tape);
  group.add(net);

  scene.add(group);
  return { update: () => {}, group };
}
