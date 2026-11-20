import * as THREE from 'three';

export function addLighthouse(scene, layout, rng) {
  const group = new THREE.Group();

  // Far end of the coast (east side, on rocky point in ocean)
  const x = 420;
  const z = 470;
  const baseY = 0.8;

  const rockMat = new THREE.MeshLambertMaterial({ color: 0x6b6f73 });
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(9, 0), rockMat);
  rock.position.set(x, baseY + 1.8, z);
  rock.scale.set(1.5, 0.7, 1.3);
  group.add(rock);
  const rock2 = new THREE.Mesh(new THREE.DodecahedronGeometry(5.5, 0), rockMat);
  rock2.position.set(x - 6, baseY + 1.0, z + 4);
  rock2.scale.set(1.3, 0.6, 1.1);
  group.add(rock2);
  const rock3 = new THREE.Mesh(new THREE.DodecahedronGeometry(4.0, 0), rockMat);
  rock3.position.set(x + 5, baseY + 0.6, z - 5);
  rock3.scale.set(1.1, 0.5, 1.0);
  group.add(rock3);

  // 25m tall red-and-white striped tower
  const stripeCount = 5;
  const stripeH = 4.0; // body 20m
  const radiusBottom = 3.6;
  const radiusTop = 2.0;
  const towerBaseY = baseY + 3.5;
  for (let i = 0; i < stripeCount; i++) {
    const t0 = i / stripeCount;
    const t1 = (i + 1) / stripeCount;
    const r0 = radiusBottom + (radiusTop - radiusBottom) * t0;
    const r1 = radiusBottom + (radiusTop - radiusBottom) * t1;
    const geo = new THREE.CylinderGeometry(r1, r0, stripeH, 14);
    const mat = new THREE.MeshLambertMaterial({ color: i % 2 === 0 ? 0xf2f2f2 : 0xd94141 });
    const seg = new THREE.Mesh(geo, mat);
    seg.position.set(x, towerBaseY + i * stripeH + stripeH / 2, z);
    group.add(seg);
  }

  const topY = towerBaseY + stripeCount * stripeH;

  // Gallery and lantern room
  const gallery = new THREE.Mesh(
    new THREE.CylinderGeometry(3.6, 3.6, 0.7, 14),
    new THREE.MeshLambertMaterial({ color: 0x333840 })
  );
  gallery.position.set(x, topY + 0.35, z);
  group.add(gallery);

  const lantern = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.4, 2.8, 10),
    new THREE.MeshLambertMaterial({ color: 0x9fd8ff, emissive: 0x335577, transparent: true, opacity: 0.85 })
  );
  lantern.position.set(x, topY + 2.1, z);
  group.add(lantern);

  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(2.6, 2.4, 10),
    new THREE.MeshLambertMaterial({ color: 0xd94141 })
  );
  cap.position.set(x, topY + 4.6, z);
  group.add(cap);

  // Rotating light beam
  const beamGroup = new THREE.Group();
  beamGroup.position.set(x, topY + 2.1, z);
  const beamGeo = new THREE.ConeGeometry(2.8, 90, 16, 1, true);
  beamGeo.translate(0, -45, 0);
  beamGeo.rotateX(-Math.PI / 2);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff6c8, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beamGroup.add(beam);
  const beamCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 1.0, 70, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffffee, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })
  );
  beamCore.rotation.x = -Math.PI / 2;
  beamCore.position.z = 35;
  beamGroup.add(beamCore);
  group.add(beamGroup);

  // door
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.3), new THREE.MeshLambertMaterial({ color: 0x3b2b20 }));
  door.position.set(x, towerBaseY + 1.4, z + radiusBottom - 0.2);
  group.add(door);

  scene.add(group);

  function update(dt) {
    beamGroup.rotation.y += dt * 0.8;
  }

  return { update, group };
}
