import * as THREE from 'three';

export function addLagoonBridge(scene, layout, rng) {
  const group = new THREE.Group();

  // Lagoon Bridge district (east side, i 4-7 j 8-9 => around x ~ 90, z ~ 250), bridge towers 45m
  const cx = 110;
  const cz = 265;
  const deckY = 10.0;
  const span = 160;
  const width = 20;
  const towerH = 45;

  const deckMat = new THREE.MeshLambertMaterial({ color: 0x4a4f57 });
  const towerMat = new THREE.MeshLambertMaterial({ color: 0xd8dde6 });
  const cableMat = new THREE.MeshLambertMaterial({ color: 0xb8c2cc });

  // Deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 1.4, span), deckMat);
  deck.position.set(cx, deckY, cz);
  group.add(deck);

  // Road markings
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, span - 12), new THREE.MeshBasicMaterial({ color: 0xf2efe6 }));
  line.position.set(cx, deckY + 0.73, cz);
  group.add(line);

  // Railings
  const railGeo = new THREE.BoxGeometry(0.35, 1.1, span);
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(railGeo, towerMat);
    rail.position.set(cx + side * (width / 2 - 0.6), deckY + 1.25, cz);
    group.add(rail);
  }

  // Towers
  const towerOffset = span * 0.28;
  const towerGeo = new THREE.BoxGeometry(3.8, towerH, 3.8);
  const towerTops = [];
  for (const tz of [cz - towerOffset, cz + towerOffset]) {
    for (const side of [-1, 1]) {
      const t = new THREE.Mesh(towerGeo, towerMat);
      t.position.set(cx + side * 5.0, towerH / 2, tz);
      group.add(t);
      towerTops.push({ x: cx + side * 5.0, y: towerH - 1.5, z: tz });
    }
    // cross beams
    for (const by of [towerH - 8, towerH - 18]) {
      const cross = new THREE.Mesh(new THREE.BoxGeometry(13.8, 2.2, 2.8), towerMat);
      cross.position.set(cx, by, tz);
      group.add(cross);
    }
  }

  // Suspension cables and vertical hangers
  const segGeo = new THREE.BoxGeometry(0.28, 0.28, 2.6);
  const hangerGeo = new THREE.BoxGeometry(0.14, 1, 0.14);
  const makeCable = (sideX) => {
    const z1 = cz - span / 2 + 4;
    const z2 = cz + span / 2 - 4;
    const count = 30;
    const cableSegs = new THREE.InstancedMesh(segGeo, cableMat, count);
    const hangers = new THREE.InstancedMesh(hangerGeo, cableMat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const z = z1 + (z2 - z1) * t;
      const mid = cz;
      const distToMid = Math.abs(z - mid);
      const sag = 5 + (distToMid / (span / 2)) * (distToMid / (span / 2)) * 14;
      const y = towerH - 1.5 - sag;
      const t2 = (i + 1) / (count - 1);
      const zNext = z1 + (z2 - z1) * t2;
      const distToMid2 = Math.abs(zNext - mid);
      const sag2 = 5 + (distToMid2 / (span / 2)) * (distToMid2 / (span / 2)) * 14;
      const yNext = towerH - 1.5 - sag2;
      const mz = (z + zNext) / 2;
      const my = (y + yNext) / 2;
      const dz = zNext - z;
      const dy = yNext - y;
      const len = Math.sqrt(dz * dz + dy * dy);
      const ang = Math.atan2(dy, dz);
      dummy.position.set(sideX, my, mz);
      dummy.rotation.set(ang, 0, 0);
      dummy.scale.set(1, 1, len / 2.6);
      dummy.updateMatrix();
      cableSegs.setMatrixAt(i, dummy.matrix);

      const hy = (my + deckY + 0.7) / 2;
      const hh = Math.max(1, my - (deckY + 0.7));
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
  makeCable(cx - 5.0);
  makeCable(cx + 5.0);

  // Tower caps
  for (const top of towerTops) {
    const cap = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3.4, 4), towerMat);
    cap.position.set(top.x, top.y + 1.7, top.z);
    cap.rotation.y = Math.PI / 4;
    group.add(cap);
  }

  // Piers/abutments
  for (const tz of [cz - span / 2 + 6, cz + span / 2 - 6]) {
    const ab = new THREE.Mesh(new THREE.BoxGeometry(width + 6, deckY, 10), new THREE.MeshLambertMaterial({ color: 0x777f8a }));
    ab.position.set(cx, deckY / 2, tz);
    group.add(ab);
  }

  scene.add(group);
  return { update: () => {}, group };
}
