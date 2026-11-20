// Stages the chase screenshot on the beach boulevard with clear pursuit framing.
import * as THREE from 'three';
import { createCar } from '../vehicles/car.js';
import { createHelicopter } from '../police/helicopter.js';
import { createCarExplosion } from '../combat/carExplosion.js';
import { resolveCircleColliders } from '../core/collisions.js';

function makeRadialGlowTexture(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.7)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.18)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

function addSirenLights(car, phase = 0) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.12, 0.36), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.4 }));
  bar.position.set(0, 2.02, -0.05);
  car.mesh.add(bar);
  const redMat = new THREE.MeshStandardMaterial({ color: 0xff2244, emissive: 0xff2244, emissiveIntensity: 2.4 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x2a66ff, emissive: 0x2a66ff, emissiveIntensity: 0.15 });
  const red = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), redMat);
  red.position.set(-0.32, 2.16, -0.05);
  const blue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), blueMat);
  blue.position.set(0.32, 2.16, -0.05);
  car.mesh.add(red, blue);
  const rLight = new THREE.PointLight(0xff3355, 3.2, 12, 2);
  rLight.position.set(-0.32, 2.3, 0.3);
  const bLight = new THREE.PointLight(0x3388ff, 3.2, 12, 2);
  bLight.position.set(0.32, 2.3, 0.3);
  car.mesh.add(rLight, bLight);
  const glowTex = makeRadialGlowTexture();
  const glowRMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xff4466, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false });
  const glowBMat = new THREE.SpriteMaterial({ map: glowTex, color: 0x4499ff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false });
  const glowR = new THREE.Sprite(glowRMat); glowR.scale.set(1.2, 1.2, 1); glowR.position.set(-0.32, 2.22, 0.05);
  const glowB = new THREE.Sprite(glowBMat); glowB.scale.set(1.2, 1.2, 1); glowB.position.set(0.32, 2.22, 0.05);
  car.mesh.add(glowR, glowB);
  return { red, blue, rLight, bLight, glowR, glowB, phase };
}

function addSpeedLines(scene, hero) {
  const lines = [];
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 1.8 + Math.random() * 1.8), mat.clone());
    m.position.set(hero.mesh.position.x - 2.5 - Math.random() * 4, 0.35 + Math.random() * 0.9, hero.mesh.position.z + (Math.random() - 0.5) * 3.2);
    scene.add(m);
    lines.push({ m, off: Math.random() * 2, zOff: m.position.z - hero.mesh.position.z, y: m.position.y });
  }
  return lines;
}

function addTyreSmoke(scene, hero) {
  const puffs = [];
  const mat = new THREE.MeshStandardMaterial({ color: 0xdedede, transparent: true, opacity: 0.22, roughness: 1 });
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.35 + Math.random() * 0.25, 8, 8), mat.clone());
    m.position.set(hero.mesh.position.x - 2.2 - i * 0.5, 0.25, hero.mesh.position.z + (i % 2 ? 0.7 : -0.7));
    scene.add(m);
    puffs.push({ m, t: Math.random() * 1.2, side: i % 2 ? 0.7 : -0.7, back: 2.2 + i * 0.45 });
  }
  return puffs;
}

function pushCameraOut(pos, carPos, colliders, bounds) {
  let r = resolveCircleColliders(pos.x, pos.z, 0.7, colliders, bounds);
  if (Math.abs(r.x - pos.x) > 0.001 || Math.abs(r.z - pos.z) > 0.001) { pos.x = r.x; pos.z = r.z; }
  for (let i = 0; i < 4; i++) {
    r = resolveCircleColliders(pos.x, pos.z, 0.85, colliders, bounds);
    if (Math.abs(r.x - pos.x) < 0.001 && Math.abs(r.z - pos.z) < 0.001) break;
    pos.x += (carPos.x - pos.x) * 0.3;
    pos.z += (carPos.z - pos.z) * 0.3;
  }
}

export function stageChaseShot({ app, state, player }) {
  if (player && player.model) player.model.visible = false;
  const layout = state.world.layout;
  // Beach boulevard: southernmost road, ocean/sand at +z (right side of frame), buildings at -z
  const roadZ = layout.offsetZ + layout.n * layout.cell + layout.roadWidth / 2;
  const laneZ = roadZ - 1.8;
  const heroX = 0;
  const yaw = Math.PI / 2; // +x

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

  // Hero Vortex GT: low/wide sports coupe, bright coral/orange with white racing stripe
  const hero = createCar(app.scene, { x: heroX, z: laneZ, yaw, type: 'sports', color: '#ff6a2a', name: 'Solenne Vortex GT', maxSpeed: 34, driver: 'player' });
  hero.speed = 38.9;
  if (hero.mesh.userData.tailMats) hero.mesh.userData.tailMats.forEach(m => m.emissiveIntensity = 1.8);
  state.cars.push(hero);
  state.car = hero;
  state.player.inCar = hero;
  state.speed = hero.speed;
  state.player.x = heroX; state.player.z = laneZ;

  const sirens = [];
  // Two cruisers between camera and player, 2-3m closer to player and 0.5m inward so fully visible between HUD panels
  const p1 = createCar(app.scene, { x: heroX - 1.5, z: laneZ - 2.7, yaw: yaw + 0.03, type: 'police', color: '#f3f4f6', name: 'SHP Cruiser', maxSpeed: 30, driver: 'police' });
  p1.speed = 38.5;
  const p2 = createCar(app.scene, { x: heroX - 3.5, z: laneZ + 2.7, yaw: yaw - 0.03, type: 'police', color: '#f3f4f6', name: 'SHP Cruiser', maxSpeed: 30, driver: 'police' });
  p2.speed = 38.2;
  // One more cruiser further back
  const p3 = createCar(app.scene, { x: heroX - 15, z: laneZ + 0.8, yaw, type: 'police', color: '#f3f4f6', name: 'SHP Cruiser', maxSpeed: 30, driver: 'police' });
  p3.speed = 36;
  // MARLIN-1 ahead on the side, kept out of roadblock sightline
  const marlin = createCar(app.scene, { x: heroX + 20, z: laneZ - 4.0, yaw: yaw + 0.08, type: 'police', color: '#f3f4f6', name: 'MARLIN Interceptor', maxSpeed: 32, driver: 'police' });
  marlin.speed = 39;
  [p1, p2, p3, marlin].forEach((p, i) => { state.cars.push(p); sirens.push(addSirenLights(p, i * 0.8)); });

  // BULWARK roadblock ~30m ahead: two big dark navy armoured trucks across both lanes at an angle with bright chevrons
  const blockX = heroX + 30;
  const rb1 = createCar(app.scene, { x: blockX - 0.8, z: laneZ - 2.0, yaw: yaw + 1.48, type: 'armoured', color: '#0b1b3a', name: 'BULWARK Truck', driver: 'police' });
  const rb2 = createCar(app.scene, { x: blockX + 0.8, z: laneZ + 2.0, yaw: yaw - 1.48, type: 'armoured', color: '#0b1b3a', name: 'BULWARK Truck', driver: 'police' });
  rb1.speed = 0; rb2.speed = 0;
  rb1.mesh.scale.set(1.45, 1.45, 1.45);
  rb2.mesh.scale.set(1.45, 1.45, 1.45);
  state.cars.push(rb1, rb2);
  sirens.push(addSirenLights(rb1, 0.3));
  sirens.push(addSirenLights(rb2, 1.1));
  const chevMat = new THREE.MeshStandardMaterial({ color: 0xffe000, emissive: 0xffb300, emissiveIntensity: 0.65, roughness: 0.28, metalness: 0.25 });
  for (const rb of [rb1, rb2]) {
    const chev = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const w = 1.35 - i * 0.24;
      const y = 0.95 + i * 0.26;
      const l = new THREE.Mesh(new THREE.BoxGeometry(w * 0.56, 0.18, 0.1), chevMat);
      l.position.set(-w * 0.18, y, 2.4); l.rotation.z = 0.55;
      const r = new THREE.Mesh(new THREE.BoxGeometry(w * 0.56, 0.18, 0.1), chevMat);
      r.position.set(w * 0.18, y, 2.4); r.rotation.z = -0.55;
      chev.add(l, r);
    }
    rb.mesh.add(chev);
  }
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xff7a00, emissive: 0xff5500, emissiveIntensity: 0.7 });
  // orange cones in front (toward player) and across lanes
  for (let i = 0; i < 12; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.05, 8), coneMat);
    const t = i / 11;
    cone.position.set(blockX - 4.5 - t * 4.5, 0.52, laneZ - 3.6 + t * 7.2);
    cone.castShadow = true; app.scene.add(cone);
  }
  // "POLICE LINE" barrier between trucks
  const tapeCanvas = document.createElement('canvas');
  tapeCanvas.width = 512; tapeCanvas.height = 64;
  const tctx = tapeCanvas.getContext('2d');
  tctx.fillStyle = '#111'; tctx.fillRect(0, 0, 512, 64);
  tctx.fillStyle = '#ffd400';
  for (let i = -80; i < 560; i += 96) { tctx.beginPath(); tctx.moveTo(i, 0); tctx.lineTo(i + 48, 0); tctx.lineTo(i + 12, 64); tctx.lineTo(i - 36, 64); tctx.closePath(); tctx.fill(); }
  tctx.fillStyle = '#0b1b3a'; tctx.fillRect(0, 17, 512, 30);
  tctx.font = 'bold 22px Arial'; tctx.fillStyle = '#ffffff'; tctx.textAlign = 'center'; tctx.textBaseline = 'middle';
  tctx.fillText('POLICE LINE  •  POLICE LINE  •  POLICE LINE', 256, 32);
  const tapeTex = new THREE.CanvasTexture(tapeCanvas);
  tapeTex.wrapS = tapeTex.wrapT = THREE.RepeatWrapping; tapeTex.repeat.set(2, 1);
  tapeTex.needsUpdate = true;
  const barrier = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.9, 0.2), new THREE.MeshStandardMaterial({ map: tapeTex, color: 0xffffff, emissive: 0x554400, emissiveIntensity: 0.3, roughness: 0.55 }));
  barrier.position.set(blockX - 1.5, 1.1, laneZ);
  app.scene.add(barrier);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
  for (const sx of [-4.8, 4.8]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 8), postMat); post.position.set(blockX - 1.5 + sx, 0.8, laneZ); app.scene.add(post); }

  // HERON-1 lowered/moved ahead so whole body and rotor sit in upper third of frame
  const heli = createHelicopter(app.scene, state, 'HERON-1');
  heli.mesh.position.set(heroX + 32, 10.5, laneZ - 1.5);
  heli.mesh.rotation.y = yaw + 0.2;
  heli.mesh.rotation.x = -0.08;
  heli.spot.target.position.set(heroX, 0.5, laneZ);
  heli.spot.intensity = 32;
  heli.spot.angle = Math.PI / 10;
  heli.spot.distance = 220;
  const spotConeGeo = new THREE.ConeGeometry(5.2, 12, 24, 1, true);
  const spotConeMat = new THREE.MeshBasicMaterial({ color: 0xfff6d5, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide });
  const spotCone = new THREE.Mesh(spotConeGeo, spotConeMat);
  spotCone.position.set(0, -6, 0);
  heli.spot.add(spotCone);

  // Burning wreck moved onto sand at right roadside so BULWARK roadblock ~50m ahead stays visible
  const wreckX = heroX + 26;
  const wreckZ = laneZ + 11.5;
  const wreck = createCar(app.scene, { x: wreckX, z: wreckZ, yaw: yaw + 0.7, type: 'sedan', color: '#2f2f2f', name: 'Wreck', driver: null });
  wreck.damage = 1; wreck.dead = true; wreck.speed = 0; wreck.exploded = true;
  wreck.mesh.rotation.z = 0.22; wreck.mesh.position.y = -0.02;
  state.cars.push(wreck);
  const explosion = createCarExplosion(app.scene, wreckX, wreckZ);
  explosion.group.scale.setScalar(1.1);

  // Tyre smoke and speed lines for hero
  const speedLines = addSpeedLines(app.scene, hero);
  const tyreSmoke = addTyreSmoke(app.scene, hero);

  // Sun glare: warmer, more saturated cover grading with stronger rim and bloom-like glows
  app.renderer.toneMappingExposure = 1.3;
  const sun = new THREE.DirectionalLight(0xff8a24, 3.1);
  sun.position.set(heroX + 140, 9, laneZ + 12);
  sun.target.position.set(heroX + 10, 1.5, laneZ);
  app.scene.add(sun); app.scene.add(sun.target);
  const rim = new THREE.DirectionalLight(0xff6a1a, 1.6);
  rim.position.set(heroX + 120, 8, laneZ - 18);
  rim.target.position.set(heroX + 10, 1.2, laneZ);
  app.scene.add(rim); app.scene.add(rim.target);
  const hemi = new THREE.HemisphereLight(0xffe0b0, 0x406080, 0.15);
  app.scene.add(hemi);
  const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(22, 20, 20), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.12, fog: false }));
  sunGlow.position.set(heroX + 240, 16, laneZ + 8);
  app.scene.add(sunGlow);
  const sunGlowTex = makeRadialGlowTexture(256);
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex, color: 0xffd27a, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  sunSprite.scale.set(80, 80, 1); sunSprite.position.set(heroX + 240, 16, laneZ + 8); app.scene.add(sunSprite);
  const sunSprite2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex, color: 0xff9a3a, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  sunSprite2.scale.set(130, 50, 1); sunSprite2.position.set(heroX + 235, 15, laneZ + 8); app.scene.add(sunSprite2);
  if (app.scene.fog) {
    app.scene.fog.color.setHex(0xffbf7a);
    app.scene.fog.near = 16; app.scene.fog.far = 440;
  }

  state.dispatch = {
    visible: true, stars: 4,
    units: [
      { icon: '🚓', callSign: 'GULL-11', distance: 8, tag: 'RAMMING' },
      { icon: '🚓', callSign: 'GULL-12', distance: 9, tag: 'FLANKING' },
      { icon: '🚓', callSign: 'MARLIN-1', distance: 14, tag: 'PIT' },
      { icon: '🚓', callSign: 'GULL-09', distance: 18, tag: 'PURSUIT' },
      { icon: '🚧', callSign: 'BULWARK-1', distance: 60, tag: 'ROADBLOCK' },
      { icon: '🚁', callSign: 'HERON-1', distance: 20, tag: 'SPOTLIGHT' },
    ],
    more: 0,
  };
  state.minimap = state.minimap || {};
  state.minimap.police = [
    { x: p1.mesh.position.x, z: p1.mesh.position.z, yaw: p1.yaw },
    { x: p2.mesh.position.x, z: p2.mesh.position.z, yaw: p2.yaw },
    { x: p3.mesh.position.x, z: p3.mesh.position.z, yaw: p3.yaw },
    { x: marlin.mesh.position.x, z: marlin.mesh.position.z, yaw: marlin.yaw },
  ];
  state.minimap.target = { x: heroX, z: laneZ - 150 };

  const camPos = new THREE.Vector3(heroX - 10, 3.5, laneZ);
  const lookAt = new THREE.Vector3(heroX + 18, 1.2, laneZ);
  pushCameraOut(camPos, new THREE.Vector3(heroX, 3.5, laneZ), state.colliders || [], state.world.bounds);

  return {
    camera: { position: camPos.clone(), lookAt: lookAt.clone(), fov: 70 },
    hudExtra: () => ({ timeLabel: '19:08 Golden Hour', prompt: null }),
    update(dt, frame) {
      state.player.x = hero.mesh.position.x; state.player.z = hero.mesh.position.z;
      state.speed = Math.abs(hero.speed || 0);

      heli.rotor.rotation.y += dt * 24;
      heli.tailRotor.rotation.x += dt * 30;
      heli.spot.target.position.set(hero.mesh.position.x, 0.5, hero.mesh.position.z);
      heli.spot.target.updateMatrixWorld();
      spotCone.material.opacity = 0.08 + Math.sin(frame * 0.12) * 0.02;

      explosion.update(dt);
      for (const s of sirens) {
        s.phase += dt * 10;
        const on = Math.sin(s.phase) > 0;
        s.red.material.emissiveIntensity = on ? 2.8 : 0.08;
        s.blue.material.emissiveIntensity = on ? 0.08 : 2.8;
        s.rLight.intensity = on ? 3.6 : 0.0;
        s.bLight.intensity = on ? 0.0 : 3.6;
        if (s.glowR) s.glowR.material.opacity = on ? 0.8 : 0.08;
        if (s.glowB) s.glowB.material.opacity = on ? 0.08 : 0.8;
      }

      for (const l of speedLines) {
        l.m.position.x = hero.mesh.position.x - 2.8 - (l.off * 1.2) - ((frame * 0.9 + l.off * 20) % 3);
        l.m.position.z = hero.mesh.position.z + l.zOff;
        l.m.position.y = l.y;
        l.m.material.opacity = 0.18 + Math.abs(Math.sin(frame * 0.2 + l.off)) * 0.18;
      }
      for (const p of tyreSmoke) {
        p.t += dt;
        const cycle = p.t % 1.0;
        p.m.position.x = hero.mesh.position.x - p.back - cycle * 1.8;
        p.m.position.z = hero.mesh.position.z + p.side + Math.sin(frame * 0.1 + p.back) * 0.08;
        p.m.position.y = 0.22 + cycle * 0.35;
        const s = 0.5 + cycle * 1.1;
        p.m.scale.setScalar(s);
        p.m.material.opacity = (1 - cycle) * 0.22;
      }

      const desired = new THREE.Vector3(hero.mesh.position.x - 10, 3.5, hero.mesh.position.z);
      const tgt = new THREE.Vector3(hero.mesh.position.x + 18, 1.2, hero.mesh.position.z);
      pushCameraOut(desired, hero.mesh.position, state.colliders || [], state.world.bounds);
      desired.y = 3.5;
      if (desired.x > hero.mesh.position.x - 8.5) desired.x = hero.mesh.position.x - 8.5;
      this.camera = { position: desired, lookAt: tgt, fov: 70 };
    },
  };
}
