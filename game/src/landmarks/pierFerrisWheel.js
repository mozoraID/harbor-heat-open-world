import * as THREE from 'three';

export function addPierFerrisWheel(scene, layout, rng) {
  const rand = typeof rng === 'function' ? rng : () => Math.random();
  const group = new THREE.Group();

  // Old Pier jutting south into the ocean from Old Pier district (south-west)
  const pierX = -300;
  const pierZStart = 340; // near beach edge / end of blocks
  const pierLen = 120;
  const pierW = 18;
  const deckY = 3.6;
  const pierZEnd = pierZStart + pierLen;
  const pierCZ = (pierZStart + pierZEnd) / 2;

  const woodMat = new THREE.MeshLambertMaterial({ color: 0x7a5230 });
  const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x5b3a21 });
  const railMat = new THREE.MeshLambertMaterial({ color: 0x8b6a46 });

  // Deck planks
  const plankGeo = new THREE.BoxGeometry(pierW, 0.45, 2.8);
  const plankCount = Math.ceil(pierLen / 2.8);
  const planks = new THREE.InstancedMesh(plankGeo, woodMat, plankCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < plankCount; i++) {
    const z = pierZStart + 1.4 + i * 2.8;
    dummy.position.set(pierX, deckY, z);
    dummy.rotation.y = (rand() - 0.5) * 0.015;
    dummy.updateMatrix();
    planks.setMatrixAt(i, dummy.matrix);
  }
  planks.instanceMatrix.needsUpdate = true;
  group.add(planks);

  // Pilings
  const pileGeo = new THREE.CylinderGeometry(0.5, 0.65, 9, 6);
  const pileRows = Math.ceil(pierLen / 8);
  const piles = new THREE.InstancedMesh(pileGeo, darkWoodMat, pileRows * 2);
  let pi = 0;
  for (let i = 0; i < pileRows; i++) {
    const z = pierZStart + 4 + i * 8;
    for (const side of [-1, 1]) {
      dummy.position.set(pierX + side * (pierW / 2 - 1.8), -0.8, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      piles.setMatrixAt(pi++, dummy.matrix);
    }
  }
  piles.instanceMatrix.needsUpdate = true;
  group.add(piles);

  // Railing posts
  const postGeo = new THREE.BoxGeometry(0.22, 1.5, 0.22);
  const postCount = pileRows * 2;
  const posts = new THREE.InstancedMesh(postGeo, railMat, postCount);
  pi = 0;
  for (let i = 0; i < pileRows; i++) {
    const z = pierZStart + 4 + i * 8;
    for (const side of [-1, 1]) {
      dummy.position.set(pierX + side * (pierW / 2 - 0.7), deckY + 1.0, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      posts.setMatrixAt(pi++, dummy.matrix);
    }
  }
  posts.instanceMatrix.needsUpdate = true;
  group.add(posts);

  const railGeo = new THREE.BoxGeometry(0.16, 0.16, pierLen);
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(pierX + side * (pierW / 2 - 0.7), deckY + 1.65, pierCZ);
    group.add(rail);
  }

  // String lights
  const bulbGeo = new THREE.SphereGeometry(0.18, 6, 6);
  const bulbColors = [0xfff2a8, 0xffb347, 0xff7b7b, 0x7be0ff, 0xb6ff7b];
  const bulbCount = Math.floor(pierLen / 3.5) * 2;
  const bulbs = new THREE.InstancedMesh(bulbGeo, new THREE.MeshBasicMaterial({ color: 0xfff2a8 }), bulbCount);
  const color = new THREE.Color();
  let bi = 0;
  for (let i = 0; i < Math.floor(pierLen / 3.5); i++) {
    const z = pierZStart + 3 + i * 3.5;
    for (const side of [-1, 1]) {
      dummy.position.set(pierX + side * (pierW / 2 - 0.7), deckY + 1.8 + Math.sin(i * 0.9) * 0.12, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      bulbs.setMatrixAt(bi, dummy.matrix);
      color.setHex(bulbColors[(i + (side > 0 ? 1 : 0)) % bulbColors.length]);
      bulbs.setColorAt(bi, color);
      bi++;
    }
  }
  bulbs.instanceMatrix.needsUpdate = true;
  if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true;
  group.add(bulbs);

  // Ferris wheel (35m diameter => radius 17.5)
  const wheelRadius = 17.5;
  const wheelCenter = new THREE.Vector3(pierX, deckY + wheelRadius + 3.5, pierZEnd - 18);
  const wheel = new THREE.Group();
  wheel.position.copy(wheelCenter);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.8, 12), new THREE.MeshLambertMaterial({ color: 0xd9d9df }));
  hub.rotation.z = Math.PI / 2;
  wheel.add(hub);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius, 0.45, 8, 36), new THREE.MeshLambertMaterial({ color: 0xf0f4ff }));
  wheel.add(rim);
  const innerRim = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius * 0.55, 0.28, 8, 28), new THREE.MeshLambertMaterial({ color: 0xcad3e6 }));
  wheel.add(innerRim);

  const spokeGeo = new THREE.BoxGeometry(0.28, wheelRadius * 2, 0.28);
  const spokeCount = 16;
  const spokes = new THREE.InstancedMesh(spokeGeo, new THREE.MeshLambertMaterial({ color: 0xe8edf7 }), spokeCount);
  for (let i = 0; i < spokeCount; i++) {
    const a = (i / spokeCount) * Math.PI * 2;
    dummy.position.set(0, 0, 0);
    dummy.rotation.set(0, 0, a);
    dummy.updateMatrix();
    spokes.setMatrixAt(i, dummy.matrix);
  }
  spokes.instanceMatrix.needsUpdate = true;
  wheel.add(spokes);

  // Gondolas
  const gondolaCount = 16;
  const gondolas = [];
  const gondolaColors = [0xff5e57, 0x4bcffa, 0xffdd59, 0x34e7e4, 0xc56cf0, 0xff9f1a, 0x2ecc71, 0xff6b81];
  for (let i = 0; i < gondolaCount; i++) {
    const a = (i / gondolaCount) * Math.PI * 2;
    const g = new THREE.Group();
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 2.4, 2.6),
      new THREE.MeshLambertMaterial({ color: gondolaColors[i % gondolaColors.length] })
    );
    cabin.position.y = -1.5;
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.0, 1.3, 4),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    roof.position.y = 0.25;
    roof.rotation.y = Math.PI / 4;
    g.add(cabin, roof);
    g.position.set(Math.cos(a) * wheelRadius, Math.sin(a) * wheelRadius, 0);
    wheel.add(g);
    gondolas.push(g);
  }

  // Support A-frame
  const supportMat = new THREE.MeshLambertMaterial({ color: 0xb0b8c8 });
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(1.4, 26, 1.4), supportMat);
    leg.position.set(pierX + side * 5.5, deckY + 11, wheelCenter.z);
    leg.rotation.z = side * 0.22;
    leg.rotation.x = -0.1;
    group.add(leg);
  }
  const base = new THREE.Mesh(new THREE.BoxGeometry(15, 1.4, 10), supportMat);
  base.position.set(pierX, deckY + 0.9, wheelCenter.z);
  group.add(base);

  group.add(wheel);
  scene.add(group);

  function update(dt) {
    wheel.rotation.z += dt * 0.22;
    for (const g of gondolas) g.rotation.z = -wheel.rotation.z;
  }

  return { update, group };
}
