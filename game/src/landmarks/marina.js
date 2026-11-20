import * as THREE from 'three';

export function addMarina(scene, layout, rng) {
  const rand = typeof rng === 'function' ? rng : () => Math.random();
  const group = new THREE.Group();

  // Lagoon water area near bridge (from mapData: x -198.8, z 340, w 140, h 100)
  const cx = -200;
  const cz = 340;
  const dockY = 1.0;

  const woodMat = new THREE.MeshLambertMaterial({ color: 0x7d5a3c });
  const postMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });

  // Main dock and finger piers
  const mainDock = new THREE.Mesh(new THREE.BoxGeometry(120, 0.5, 6), woodMat);
  mainDock.position.set(cx, dockY, cz - 40);
  group.add(mainDock);

  const fingerGeo = new THREE.BoxGeometry(4, 0.5, 28);
  const fingerCount = 4;
  const fingers = new THREE.InstancedMesh(fingerGeo, woodMat, fingerCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < fingerCount; i++) {
    const fx = cx - 45 + i * 30;
    dummy.position.set(fx, dockY, cz - 23);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    fingers.setMatrixAt(i, dummy.matrix);
  }
  fingers.instanceMatrix.needsUpdate = true;
  group.add(fingers);

  // Posts
  const postGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.2, 6);
  const postCount = 30;
  const posts = new THREE.InstancedMesh(postGeo, postMat, postCount);
  let pi = 0;
  for (let i = 0; i < 12 && pi < postCount; i++) {
    const px = cx - 55 + i * 10;
    dummy.position.set(px, dockY - 0.6, cz - 43);
    dummy.updateMatrix(); posts.setMatrixAt(pi++, dummy.matrix);
    dummy.position.set(px, dockY - 0.6, cz - 37);
    dummy.updateMatrix(); posts.setMatrixAt(pi++, dummy.matrix);
  }
  for (let f = 0; f < fingerCount && pi < postCount; f++) {
    const fx = cx - 45 + f * 30;
    for (let k = 0; k < 2 && pi < postCount; k++) {
      dummy.position.set(fx + (k ? 2 : -2), dockY - 0.6, cz - 10);
      dummy.updateMatrix(); posts.setMatrixAt(pi++, dummy.matrix);
    }
  }
  posts.instanceMatrix.needsUpdate = true;
  group.add(posts);

  // Boats (8-12) bobbing on water
  const boatCount = 10;
  const boats = [];
  const hullColors = [0xffffff, 0x2f6fed, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x34495e, 0x9b59b6];
  for (let i = 0; i < boatCount; i++) {
    const b = new THREE.Group();
    const isYacht = i % 3 === 0;
    const len = isYacht ? 10 + rand() * 4 : 5.5 + rand() * 2.5;
    const wid = isYacht ? 3.2 : 2.0;
    const hcol = hullColors[Math.floor(rand() * hullColors.length)];
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(wid, isYacht ? 1.6 : 1.1, len),
      new THREE.MeshLambertMaterial({ color: hcol })
    );
    hull.position.y = isYacht ? 0.8 : 0.55;
    b.add(hull);
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(wid * 0.9, 0.3, len * 0.8),
      new THREE.MeshLambertMaterial({ color: 0xf4f1e6 })
    );
    deck.position.y = isYacht ? 1.6 : 1.1;
    b.add(deck);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(wid * 0.7, isYacht ? 1.4 : 0.9, len * 0.28),
      new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    cabin.position.set(0, isYacht ? 2.4 : 1.7, -len * 0.05);
    b.add(cabin);
    if (isYacht) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5, 6), new THREE.MeshLambertMaterial({ color: 0xdedede }));
      mast.position.set(0, 4.0, len * 0.1);
      b.add(mast);
    }

    // placement slots around fingers
    const side = i % 2 === 0 ? -1 : 1;
    const finger = Math.floor(i / 2) % fingerCount;
    const fx = cx - 45 + finger * 30;
    const bx = fx + side * (3.8 + rand() * 1.2);
    const bz = cz - 18 - (i % 3) * 7 + rand() * 2;
    b.position.set(bx, 0.15, bz);
    b.rotation.y = (side > 0 ? Math.PI / 2 : -Math.PI / 2) + (rand() - 0.5) * 0.15;
    b.userData = { phase: rand() * Math.PI * 2, amp: 0.08 + rand() * 0.07, roll: 0.02 + rand() * 0.03, baseY: 0.15 };
    group.add(b);
    boats.push(b);
  }

  scene.add(group);

  let t = 0;
  function update(dt) {
    t += dt;
    for (const b of boats) {
      const u = b.userData;
      b.position.y = u.baseY + Math.sin(t * 1.4 + u.phase) * u.amp;
      b.rotation.z = Math.sin(t * 1.1 + u.phase) * u.roll;
      b.rotation.x = Math.sin(t * 0.9 + u.phase * 1.3) * u.roll * 0.7;
    }
  }

  return { update, group };
}
