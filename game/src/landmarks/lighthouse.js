import * as THREE from 'three';

export function addLighthouse(scene, layout, rng) {
  const group = new THREE.Group();

  // Rocky point west of pier in ocean
  const x = -380;
  const z = 420;
  const baseY = 0.5;

  const rockMat = new THREE.MeshLambertMaterial({ color: 0x6b6f73 });
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(7, 0), rockMat);
  rock.position.set(x, baseY + 1.5, z);
  rock.scale.set(1.4, 0.7, 1.2);
  group.add(rock);
  const rock2 = new THREE.Mesh(new THREE.DodecahedronGeometry(4.5, 0), rockMat);
  rock2.position.set(x + 5, baseY + 0.8, z - 3);
  rock2.scale.set(1.2, 0.6, 1.0);
  group.add(rock2);

  // Red-and-white striped tower (stacked cylinders for low draw calls)
  const stripeCount = 6;
  const stripeH = 4.2;
  const radiusBottom = 3.2;
  const radiusTop = 1.8;
  const stripes = [];
  for (let i = 0; i < stripeCount; i++) {
    const t0 = i / stripeCount;
    const t1 = (i + 1) / stripeCount;
    const r0 = radiusBottom + (radiusTop - radiusBottom) * t0;
    const r1 = radiusBottom + (radiusTop - radiusBottom) * t1;
    const geo = new THREE.CylinderGeometry(r1, r0, stripeH, 12);
    const mat = new THREE.MeshLambertMaterial({ color: i % 2 === 0 ? 0xf2f2f2 : 0xd94141 });
    const seg = new THREE.Mesh(geo, mat);
    seg.position.set(x, baseY + 4 + i * stripeH + stripeH / 2, z);
    group.add(seg);
    stripes.push(seg);
  }

  // Gallery and lantern room
  const gallery = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.2, 0.6, 12),
    new THREE.MeshLambertMaterial({ color: 0x333840 })
  );
  gallery.position.set(x, baseY + 4 + stripeCount * stripeH + 0.3, z);
  group.add(gallery);

  const lantern = new THREE.Mesh(
    new THREE.CylinderGeometry(1.9, 2.2, 2.6, 10),
    new THREE.MeshLambertMaterial({ color: 0x9fd8ff, emissive: 0x335577, transparent: true, opacity: 0.85 })
  );
  lantern.position.set(x, baseY + 4 + stripeCount * stripeH + 1.9, z);
  group.add(lantern);

  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(2.3, 2.2, 10),
    new THREE.MeshLambertMaterial({ color: 0xd94141 })
  );
  cap.position.set(x, baseY + 4 + stripeCount * stripeH + 4.0, z);
  group.add(cap);

  // Rotating light beam (visible at night-ish; always rotating)
  const beamGroup = new THREE.Group();
  beamGroup.position.set(x, baseY + 4 + stripeCount * stripeH + 1.9, z);
  const beamGeo = new THREE.ConeGeometry(2.2, 70, 16, 1, true);
  beamGeo.translate(0, -35, 0);
  beamGeo.rotateX(-Math.PI / 2);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff6c8, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beamGroup.add(beam);
  const beamCore = new THREE.Mesh(
    new THREE.SpotLight ? new THREE.CylinderGeometry(0.2, 0.8, 55, 8, 1, true) : new THREE.CylinderGeometry(0.2, 0.8, 55, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffee, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false })
  );
  beamCore.rotation.x = -Math.PI / 2;
  beamCore.position.z = 27.5;
  beamGroup.add(beamCore);
  group.add(beamGroup);

  // small door
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.3), new THREE.MeshLambertMaterial({ color: 0x3b2b20 }));
  door.position.set(x, baseY + 5.1, z + radiusBottom - 0.2);
  group.add(door);

  scene.add(group);

  function update(dt) {
    beamGroup.rotation.y += dt * 0.9;
  }

  return { update, group };
}
