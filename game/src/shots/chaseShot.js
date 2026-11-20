// Stages the chase screenshot on the beach boulevard with correct framing and entities.
import * as THREE from 'three';
import { createCar } from '../vehicles/car.js';
import { createHelicopter } from '../police/helicopter.js';
import { createCarExplosion } from '../combat/carExplosion.js';
import { resolveCircleColliders } from '../core/collisions.js';

function addSirenLights(car, phase = 0) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.34), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.4 }));
  bar.position.set(0, 2.05, -0.05);
  car.mesh.add(bar);
  const redMat = new THREE.MeshStandardMaterial({ color: 0xff2244, emissive: 0xff2244, emissiveIntensity: 2.2 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x2a66ff, emissive: 0x2a66ff, emissiveIntensity: 0.15 });
  const red = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.28), redMat);
  red.position.set(-0.3, 2.16, -0.05);
  const blue = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.28), blueMat);
  blue.position.set(0.3, 2.16, -0.05);
  car.mesh.add(red, blue);
  const rLight = new THREE.PointLight(0xff3355, 2.2, 10, 2);
  rLight.position.set(-0.3, 2.25, 0.2);
  const bLight = new THREE.PointLight(0x3388ff, 2.2, 10, 2);
  bLight.position.set(0.3, 2.25, 0.2);
  car.mesh.add(rLight, bLight);
  return { red, blue, rLight, bLight, phase };
}

function makeDebris(scene, x, y, z) {
  const parts = [];
  const mat = new THREE.MeshStandardMaterial({ color: 0x333, roughness: 0.9 });
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.25 + Math.random() * 0.35, 0.08 + Math.random() * 0.2, 0.25 + Math.random() * 0.35), mat);
    m.position.set(x + (Math.random() - 0.5) * 4, y + Math.random() * 0.6, z + (Math.random() - 0.5) * 4);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    m.castShadow = true;
    scene.add(m);
    parts.push(m);
  }
  return parts;
}

function pushCameraOut(pos, carPos, colliders, bounds) {
  // ensure camera not inside building colliders: move inward toward car/lane if intersecting
  let p = { x: pos.x, z: pos.z };
  const r = resolveCircleColliders(p.x, p.z, 0.6, colliders, bounds);
  if (Math.abs(r.x - p.x) > 0.001 || Math.abs(r.z - p.z) > 0.001) {
    pos.x = r.x; pos.z = r.z;
  }
  // additional nudge toward car if still very close to a collider edge (simple inward step)
  for (let i = 0; i < 3; i++) {
    const r2 = resolveCircleColliders(pos.x, pos.z, 0.75, colliders, bounds);
    if (Math.abs(r2.x - pos.x) < 0.001 && Math.abs(r2.z - pos.z) < 0.001) break;
    pos.x += (carPos.x - pos.x) * 0.25;
    pos.z += (carPos.z - pos.z) * 0.25;
  }
}

export function stageChaseShot({ app, state, player }) {
  if (player && player.model) player.model.visible = false;
  const layout = state.world.layout;
  // Beach boulevard: southernmost road, ocean/sand at +z, buildings at -z
  const roadZ = layout.offsetZ + layout.n * layout.cell + layout.roadWidth / 2; // ~252
  // drive east (+x), stay in lane slightly toward buildings side so ocean is visible to the right (+z)
  const laneZ = roadZ - 1.6;
  const heroX = 0;
  const yaw = Math.PI / 2; // +x
  const forward = new THREE.Vector3(1, 0, 0);

  state.player.money = 4820;
  state.player.health = 76;
  state.player.armour = 25;
  state.player.wanted = 4;
  state.player.activeWeapon = 4;
  state.activeWeapon = 4;
  state.rank = { name: 'Wheelman', xp: 68, next: 100 };
  state.mission = { number: 3, act: 'ACT I', title: 'Tide Breaker', stage: 3, stageTotal: 4, objective: 'Lose the SHP before the Lagoon Bridge', next: 'Hit the spray shop in Old Pier', highlight: 'Lose' };
  state.radio = { station: 'KRUSH 94.2', genre: 'Synth Nights', track: 'Neon Runway', visible: true };
  state.dialogue = { visible: true, speaker: 'Sasha Lune', role: 'Fixer', text: 'Rio, keep the wheel straight—BULWARK is blocking the boulevard ahead. Cut past it before HERON boxes you in!', seed: 'sasha' };
  state.districtName = 'Marigold Beach';
  state.wanted = { searching: false, status: 'AIR UNIT OVERHEAD' };
  state.dispatch = {
    visible: true, stars: 4,
    units: [
      { icon: '🚓', callSign: 'GULL-11', distance: 6, tag: 'RAMMING' },
      { icon: '🚓', callSign: 'GULL-12', distance: 7, tag: 'FLANKING' },
      { icon: '🚓', callSign: 'MARLIN-1', distance: 14, tag: 'PIT' },
      { icon: '🚓', callSign: 'GULL-09', distance: 22, tag: 'PURSUIT' },
      { icon: '🚧', callSign: 'BULWARK-1', distance: 60, tag: 'ROADBLOCK' },
      { icon: '🚁', callSign: 'HERON-1', distance: 15, tag: 'SPOTLIGHT' },
    ],
    more: 0,
  };

  // Hero Vortex GT lower-middle, centre of lane
  const hero = createCar(app.scene, { x: heroX, z: laneZ, yaw, type: 'sports', color: '#2fd1c5', name: 'Solenne Vortex GT', maxSpeed: 34, driver: 'player' });
  hero.speed = 38.9;
  state.cars.push(hero);
  state.car = hero;
  state.player.inCar = hero;
  state.speed = hero.speed;
  state.player.x = heroX; state.player.z = laneZ;

  const sirens = [];
  // Two cruisers just behind on both sides, one partly beside the player car
  const p1 = createCar(app.scene, { x: heroX - 4.5, z: laneZ - 2.6, yaw: yaw + 0.06, type: 'police', color: '#1f2937', name: 'SHP Cruiser', maxSpeed: 30, driver: 'police' });
  p1.speed = 37;
  const p2 = createCar(app.scene, { x: heroX - 2.5, z: laneZ + 2.4, yaw: yaw - 0.04, type: 'police', color: '#1f2937', name: 'SHP Cruiser', maxSpeed: 30, driver: 'police' });
  p2.speed = 38;
  // One more cruiser further back
  const p3 = createCar(app.scene, { x: heroX - 18, z: laneZ + 0.8, yaw, type: 'police', color: '#1f2937', name: 'SHP Cruiser', maxSpeed: 30, driver: 'police' });
  p3.speed = 36;
  // MARLIN-1 ahead on the side
  const marlin = createCar(app.scene, { x: heroX + 14, z: laneZ + 3.4, yaw: yaw - 0.12, type: 'police', color: '#202a3a', name: 'MARLIN Interceptor', maxSpeed: 32, driver: 'police' });
  marlin.speed = 39;
  [p1, p2, p3, marlin].forEach((p, i) => { state.cars.push(p); sirens.push(addSirenLights(p, i * 0.8)); });

  // BULWARK roadblock ~60m ahead, blocking lanes
  const blockX = heroX + 60;
  const rb1 = createCar(app.scene, { x: blockX - 1.5, z: laneZ - 2.8, yaw: yaw + Math.PI / 2.2, type: 'armoured', color: '#39424e', name: 'BULWARK Truck', driver: 'police' });
  const rb2 = createCar(app.scene, { x: blockX + 2.0, z: laneZ + 2.6, yaw: yaw - Math.PI / 2.4, type: 'armoured', color: '#39424e', name: 'BULWARK Truck', driver: 'police' });
  rb1.speed = 0; rb2.speed = 0;
  state.cars.push(rb1, rb2);
  sirens.push(addSirenLights(rb1, 0.3));
  sirens.push(addSirenLights(rb2, 1.1));
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xff7a00, emissive: 0xff5500, emissiveIntensity: 0.35 });
  for (let i = 0; i < 8; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.95, 8), coneMat);
    cone.position.set(blockX - 5 + i * 1.6, 0.48, laneZ - 4.2 + (i % 2) * 0.6);
    cone.castShadow = true; app.scene.add(cone);
  }

  // HERON-1 hovering 25m high, ~15m ahead, upper middle, spotlight on player car
  const heli = createHelicopter(app.scene, state, 'HERON-1');
  heli.mesh.position.set(heroX + 15, 25, laneZ - 2);
  heli.spot.target.position.set(heroX, 0.5, laneZ);
  heli.spot.intensity = 30;
  heli.spot.angle = Math.PI / 10;
  heli.spot.distance = 180;
  const coneGeo = new THREE.ConeGeometry(6.5, 26, 24, 1, true);
  const coneMat2 = new THREE.MeshBasicMaterial({ color: 0xfff6d5, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide });
  const spotCone = new THREE.Mesh(coneGeo, coneMat2);
  spotCone.position.set(0, -13, 0);
  heli.spot.add(spotCone);

  // Burning wrecked car with fireball, smoke, debris 20m ahead at roadside
  const wreckX = heroX + 20;
  const wreckZ = laneZ + 5.8; // roadside toward beach
  const wreck = createCar(app.scene, { x: wreckX, z: wreckZ, yaw: yaw + 0.5, type: 'sedan', color: '#3a3a3a', name: 'Wreck', driver: null });
  wreck.damage = 1; wreck.dead = true; wreck.speed = 0;
  wreck.mesh.rotation.z = 0.15;
  state.cars.push(wreck);
  const explosion = createCarExplosion(app.scene, wreckX, wreckZ);
  explosion.fire.scale.setScalar(1.6);
  explosion.smoke.scale.setScalar(1.4);
  explosion.smoke.position.y = 4.5;
  const debris = makeDebris(app.scene, wreckX, 0.4, wreckZ);
  const fireLight = new THREE.PointLight(0xff7a1a, 8, 30, 2);
  fireLight.position.set(wreckX, 2.2, wreckZ);
  app.scene.add(fireLight);

  // Sun glare: low sun in frame direction (+x, low y), warm orange haze
  const sun = new THREE.DirectionalLight(0xffb36b, 2.2);
  sun.position.set(heroX + 120, 10, laneZ + 10);
  sun.target.position.set(heroX, 2, laneZ);
  app.scene.add(sun); app.scene.add(sun.target);
  const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(18, 20, 20), new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0.18, fog: false }));
  sunGlow.position.set(heroX + 220, 18, laneZ + 5);
  app.scene.add(sunGlow);
  if (app.scene.fog) {
    app.scene.fog.color.setHex(0xffd1a1);
    app.scene.fog.near = 20; app.scene.fog.far = 420;
  }

  state.minimap = state.minimap || {};
  state.minimap.police = [
    { x: p1.mesh.position.x, z: p1.mesh.position.z, yaw: p1.yaw },
    { x: p2.mesh.position.x, z: p2.mesh.position.z, yaw: p2.yaw },
    { x: p3.mesh.position.x, z: p3.mesh.position.z, yaw: p3.yaw },
    { x: marlin.mesh.position.x, z: marlin.mesh.position.z, yaw: marlin.yaw },
  ];
  state.minimap.target = { x: heroX, z: laneZ - 150 };

  const camPos = new THREE.Vector3(heroX - 7, 2.6, laneZ);
  const lookAt = new THREE.Vector3(heroX + 18, 1.1, laneZ);
  // initial safety push
  pushCameraOut(camPos, new THREE.Vector3(heroX, 2.6, laneZ), state.colliders || [], state.world.bounds);

  return {
    camera: { position: camPos.clone(), lookAt: lookAt.clone(), fov: 70 },
    hudExtra: () => ({ timeLabel: '19:08 Golden Hour', prompt: null }),
    update(dt, frame) {
      // keep hero reference position (static shot but ensure state sync)
      state.player.x = hero.mesh.position.x; state.player.z = hero.mesh.position.z;
      state.speed = Math.abs(hero.speed || 0);

      heli.rotor.rotation.y += dt * 22;
      heli.tailRotor.rotation.x += dt * 28;
      heli.spot.target.position.set(hero.mesh.position.x, 0.5, hero.mesh.position.z);
      heli.spot.target.updateMatrixWorld();

      explosion.update(dt);
      explosion.fire.scale.setScalar(1.5 + Math.sin(frame * 0.6) * 0.12);
      fireLight.intensity = 7 + Math.sin(frame * 0.8) * 2;
      for (let i = 0; i < debris.length; i++) {
        debris[i].rotation.x += dt * 0.4;
        debris[i].rotation.y += dt * 0.3;
      }

      for (const s of sirens) {
        s.phase += dt * 10;
        const on = Math.sin(s.phase) > 0;
        s.red.material.emissiveIntensity = on ? 2.6 : 0.08;
        s.blue.material.emissiveIntensity = on ? 0.08 : 2.6;
        s.rLight.intensity = on ? 3.2 : 0.0;
        s.bLight.intensity = on ? 0.0 : 3.2;
      }

      // camera follow-along-road, check every frame for building intersection
      const desired = new THREE.Vector3(hero.mesh.position.x - 7, 2.6, hero.mesh.position.z);
      const tgt = new THREE.Vector3(hero.mesh.position.x + 18, 1.1, hero.mesh.position.z);
      pushCameraOut(desired, hero.mesh.position, state.colliders || [], state.world.bounds);
      // ensure it stays at correct height and behind
      desired.y = 2.6;
      // if pushed too close to car in x, keep behind
      if (desired.x > hero.mesh.position.x - 5.5) desired.x = hero.mesh.position.x - 5.5;
      this.camera = { position: desired, lookAt: tgt, fov: 70 };
    },
  };
}
