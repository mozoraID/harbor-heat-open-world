import * as THREE from 'three';

export function addMarina(scene, layout, rng) {
  const rand = typeof rng === 'function' ? rng : () => Math.random();
  const group = new THREE.Group();

  // Marina next to Old Pier, in ocean/lagoon area south-west
  const cx = -235;
  const cz = 430;
  const dockY = 1.2;

  const woodMat = new THREE.MeshLambertMaterial({ color: 0x7d5a3c });
  const postMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });

  // Main dock parallel to shore
  const mainDock = new THREE.Mesh(new THREE.BoxGeometry(110, 0.5, 5.5), woodMat);
  mainDock.position.set(cx, dockY, cz - 35);
  group.add(mainDock);

  // Finger piers
  const fingerGeo = new THREE.BoxGeometry(3.6, 0.5, 26);
  const fingerCount = 5;
  const fingers = new THREE.InstancedMesh(fingerGeo, woodMat, fingerCount);
  const dummy = new THREE.Object3D();
  const fingerXs = [];
  for (let i = 0; i < fingerCount; i++) {
    const fx = cx - 44 + i * 22;
    fingerXs.push(fx);
    dummy.position.set(fx, dockY, cz - 19);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    fingers.setMatrixAt(i, dummy.matrix);
  }
  fingers.instanceMatrix.needsUpdate = true;
  group.add(fingers);

  // Posts
  const postGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.4, 6);
  const postCount = 40;
  const posts = new THREE.InstancedMesh(postGeo, postMat, postCount);
  let pi = 0;
  for (let i = 0; i < 14 && pi < postCount; i++) {
    const px = cx - 52 + i * 8;
    dummy.position.set(px, dockY - 0.7, cz - 37.5);
    dummy.updateMatrix(); posts.setMatrixAt(pi++, dummy.matrix);
    dummy.position.set(px, dockY - 0.7, cz - 32.5);
    dummy.updateMatrix(); posts.setMatrixAt(pi++, dummy.matrix);
  }
  for (let f = 0; f < fingerCount && pi < postCount; f++) {
    const fx = fingerXs[f];
    for (const k of [-1.8, 1.8]) {
      if (pi >= postCount) break;
      dummy.position.set(fx + k, dockY - 0.7, cz - 7);
      dummy.updateMatrix(); posts.setMatrixAt(pi++, dummy.matrix);
    }
  }
  posts.instanceMatrix.needsUpdate = true;
  group.add(posts);

  // Boats 12-20m yachts and smaller speedboats
  const boatCount = 10;
  const boats = [];
  const hullColors = [0xffffff, 0x2f6fed, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x34495e, 0x1abc9c, 0x9b59b6];
  for (let i = 0; i < boatCount; i++) {
    const b = new THREE.Group();
    const isYacht = i < 5; // 5 yachts, 5 speedboats
    const len = isYacht ? 12 + rand() * 8 : 6 + rand() * 3; // yachts 12-20m
    const wid = isYacht ? 3.6 + rand() * 0.8 : 2.2 + rand() * 0.4;
    const hullH = isYacht ? 1.8 : 1.1;
    const hcol = hullColors[Math.floor(rand() * hullColors.length)];

    // hull
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(wid, hullH, len),
      new THREE.MeshLambertMaterial({ color: hcol })
    );
    hull.position.y = hullH / 2;
    b.add(hull);
    // bow taper
    const bow = new THREE.Mesh(
      new THREE.ConeGeometry(wid * 0.5, len * 0.22, 4),
      new THREE.MeshLambertMaterial({ color: hcol })
    );
    bow.rotation.x = Math.PI / 2;
    bow.rotation.y = Math.PI / 4;
    bow.position.set(0, hullH / 2, len / 2 + len * 0.1);
    b.add(bow);
    // deck/cabin
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(wid * 0.9, 0.25, len * 0.7),
      new THREE.MeshLambertMaterial({ color: 0xf4f1e6 })
    );
    deck.position.y = hullH + 0.12;
    b.add(deck);
    const cabinH = isYacht ? 1.6 : 0.9;
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(wid * 0.75, cabinH, len * 0.32),
      new THREE.MeshLambertMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.85 })
    );
    cabin.position.set(0, hullH + 0.25 + cabinH / 2, -len * 0.05);
    b.add(cabin);
    if (isYacht) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 6.5, 6), new THREE.MeshLambertMaterial({ color: 0xdedede }));
      mast.position.set(0, hullH + 0.25 + cabinH + 3.2, len * 0.05);
      b.add(mast);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(wid * 0.85, 0.08, 0.08), new THREE.MeshLambertMaterial({ color: 0xd0d7e2 }));
      rail.position.set(0, hullH + 0.7, len * 0.32);
      b.add(rail);
    } else {
      // speedboat windshield
      const ws = new THREE.Mesh(new THREE.BoxGeometry(wid * 0.6, 0.8, 0.1), new THREE.MeshLambertMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.7 }));
      ws.position.set(0, hullH + 0.9, len * 0.05);
      ws.rotation.x = -0.4;
      b.add(ws);
    }

    // placement slots around finger piers
    const finger = i % fingerCount;
    const side = (i % 2 === 0) ? -1 : 1;
    const fx = fingerXs[finger];
    const bx = fx + side * (3.2 + wid / 2 + rand() * 0.6);
    const bz = cz - 16 - (Math.floor(i / 2) % 3) * 7 + rand() * 1.5;
    b.position.set(bx, 0.15, bz);
    b.rotation.y = (side > 0 ? Math.PI / 2 : -Math.PI / 2) + (rand() - 0.5) * 0.12;
    b.userData = { phase: rand() * Math.PI * 2, amp: 0.08 + rand() * 0.08, roll: 0.018 + rand() * 0.025, baseY: 0.15 };
    group.add(b);
    boats.push(b);
  }

  scene.add(group);

  let t = 0;
  function update(dt) {
    t += dt;
    for (const b of boats) {
      const u = b.userData;
      b.position.y = u.baseY + Math.sin(t * 1.3 + u.phase) * u.amp;
      b.rotation.z = Math.sin(t * 1.0 + u.phase) * u.roll;
      b.rotation.x = Math.sin(t * 0.85 + u.phase * 1.3) * u.roll * 0.7;
    }
  }

  return { update, group };
}
