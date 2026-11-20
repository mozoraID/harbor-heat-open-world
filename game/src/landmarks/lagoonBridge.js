import * as THREE from 'three';

export function addLagoonBridge(scene, layout, rng) {
  const group = new THREE.Group();

  // Lagoon Bridge district area ~ i 4-7, j 8-9 => around x ~ 90, z ~ 250
  const cx = 90;
  const cz = 250;
  const deckY = 8.5;
  const span = 140;
  const width = 18;
  const towerH = 34;

  const deckMat = new THREE.MeshLambertMaterial({ color: 0x4a4f57 });
  const towerMat = new THREE.MeshLambertMaterial({ color: 0xd8dde6 });
  const cableMat = new THREE.MeshLambertMaterial({ color: 0xb8c2cc });

  // Deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 1.2, span), deckMat);
  deck.position.set(cx, deckY, cz);
  group.add(deck);

  // Road markings (simple lighter strip)
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, span - 10), new THREE.MeshBasicMaterial({ color: 0xf2efe6 }));
  line.position.set(cx, deckY + 0.63, cz);
  group.add(line);

  // Railings
  const railGeo = new THREE.BoxGeometry(0.3, 1.0, span);
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(railGeo, towerMat);
    rail.position.set(cx + side * (width / 2 - 0.5), deckY + 1.1, cz);
    group.add(rail);
  }

  // Towers
  const towerOffset = span * 0.28;
  const towerGeo = new THREE.BoxGeometry(3.2, towerH, 3.2);
  const towerTops = [];
  for (const tz of [cz - towerOffset, cz + towerOffset]) {
    for (const side of [-1, 1]) {
      const t = new THREE.Mesh(towerGeo, towerMat);
      t.position.set(cx + side * 4.2, towerH / 2, tz);
      group.add(t);
      towerTops.push({ x: cx + side * 4.2, y: towerH - 1, z: tz });
    }
    // cross beam
    const cross = new THREE.Mesh(new THREE.BoxGeometry(11.6, 2.0, 2.4), towerMat);
    cross.position.set(cx, towerH - 6, tz);
    group.add(cross);
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(11.6, 2.0, 2.4), towerMat);
    cross2.position.set(cx, towerH - 14, tz);
    group.add(cross2);
  }

  // Main suspension cables (catenary-like via segments) and vertical hangers
  const segGeo = new THREE.BoxGeometry(0.25, 0.25, 2.4);
  const hangerGeo = new THREE.BoxGeometry(0.12, 1, 0.12);
  const makeCable = (sideX) => {
    const points = [];
    for (const tz of [cz - towerOffset, cz + towerOffset]) points.push(new THREE.Vector3(sideX, towerH - 1, tz));
    // build sagging cable along span in segments
    const z1 = cz - span / 2 + 4;
    const z2 = cz + span / 2 - 4;
    const count = 28;
    const cableSegs = new THREE.InstancedMesh(segGeo, cableMat, count);
    const hangers = new THREE.InstancedMesh(hangerGeo, cableMat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const z = z1 + (z2 - z1) * t;
      // sag relative to nearest tower top
      const mid = cz;
      const distToMid = Math.abs(z - mid);
      const sag = 4 + (distToMid / (span / 2)) * (distToMid / (span / 2)) * 10;
      const y = towerH - 1 - sag;
      const t2 = (i + 1) / (count - 1);
      const zNext = z1 + (z2 - z1) * t2;
      const distToMid2 = Math.abs(zNext - mid);
      const sag2 = 4 + (distToMid2 / (span / 2)) * (distToMid2 / (span / 2)) * 10;
      const yNext = towerH - 1 - sag2;
      const mz = (z + zNext) / 2;
      const my = (y + yNext) / 2;
      const dz = zNext - z;
      const dy = yNext - y;
      const len = Math.sqrt(dz * dz + dy * dy);
      const ang = Math.atan2(dy, dz);
      dummy.position.set(sideX, my, mz);
      dummy.rotation.set(ang, 0, 0);
      dummy.scale.set(1, 1, len / 2.4);
      dummy.updateMatrix();
      cableSegs.setMatrixAt(i, dummy.matrix);

      // hanger down to deck
      const hy = (my + deckY + 0.6) / 2;
      const hh = Math.max(1, my - (deckY + 0.6));
      dummy.position.set(sideX, hy, mz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, hh, 1);
      dummy.updateMatrix();
      hangers.setMatrixAt(i, dummy.matrix);
    }
    cableSegs.instanceMatrix.needsUpdate = true;
    hangers.instanceMatrix.needsUpdate = true;
    group.add(cableSegs, hangers);
  };
  makeCable(cx - 4.2);
  makeCable(cx + 4.2);

  // Tower caps
  for (const top of towerTops) {
    const cap = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.0, 4), towerMat);
    cap.position.set(top.x, top.y + 1.5, top.z);
    cap.rotation.y = Math.PI / 4;
    group.add(cap);
  }

  scene.add(group);
  return { update: () => {}, group };
}
