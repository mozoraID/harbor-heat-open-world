// Stages the street combat screenshot in Glasswater Heights.
import * as THREE from 'three';
import { createCar } from '../vehicles/car.js';
import { createPedestrianModel } from '../actors/pedestrianModel.js';
import { createPlayerModel } from '../actors/playerModel.js';

function makeGlowTexture(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.65)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.15)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

function addSirenLights(car, phase = 0) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.12, 0.36), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.4 }));
  bar.position.set(0, 2.02, -0.05);
  car.mesh.add(bar);
  const redMat = new THREE.MeshStandardMaterial({ color: 0xff2244, emissive: 0xff2244, emissiveIntensity: 2.6 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x2a66ff, emissive: 0x2a66ff, emissiveIntensity: 0.15 });
  const red = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), redMat);
  red.position.set(-0.32, 2.16, -0.05);
  const blue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), blueMat);
  blue.position.set(0.32, 2.16, -0.05);
  car.mesh.add(red, blue);
  const rLight = new THREE.PointLight(0xff3355, 3.0, 10, 2);
  rLight.position.set(-0.32, 2.3, 0.3);
  const bLight = new THREE.PointLight(0x3388ff, 3.0, 10, 2);
  bLight.position.set(0.32, 2.3, 0.3);
  car.mesh.add(rLight, bLight);
  const glowTex = makeGlowTexture();
  const glowR = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff4466, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  glowR.scale.set(1.2, 1.2, 1); glowR.position.set(-0.32, 2.22, 0.05);
  const glowB = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x4499ff, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }));
  glowB.scale.set(1.2, 1.2, 1); glowB.position.set(0.32, 2.22, 0.05);
  car.mesh.add(glowR, glowB);
  return { red, blue, rLight, bLight, glowR, glowB, phase };
}

function makeTracer(scene, from, to, color = 0xffee88) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  if (len < 0.01) return null;
  dir.normalize();
  const geo = new THREE.BoxGeometry(0.06, 0.06, Math.min(len, 6));
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
  const m = new THREE.Mesh(geo, mat);
  const mid = new THREE.Vector3().copy(from).addScaledVector(dir, Math.min(len, 6) * 0.5);
  m.position.copy(mid);
  m.lookAt(to);
  scene.add(m);
  return m;
}

function makeMuzzleFlash(scene, pos, dir, tex) {
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xfff0a0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  flash.scale.set(1.2, 1.2, 1);
  flash.position.copy(pos).addScaledVector(dir, 0.4);
  scene.add(flash);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false }));
  core.position.copy(flash.position);
  scene.add(core);
  return { flash, core };
}

function makeHitSpark(scene, pos, tex) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xffcc66, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(0.9, 0.9, 1);
  s.position.copy(pos);
  scene.add(s);
  const bits = [];
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffee88 : 0xff9933, blending: THREE.AdditiveBlending, depthWrite: false }));
    b.position.copy(pos);
    scene.add(b);
    bits.push({ m: b, vx: (Math.random() - 0.5) * 2.5, vy: 0.5 + Math.random() * 2.0, vz: (Math.random() - 0.5) * 2.5 });
  }
  return { s, bits, t: 0 };
}

function makeShell(scene, pos, sideDir) {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), new THREE.MeshStandardMaterial({ color: 0xd4a017, emissive: 0x553300, emissiveIntensity: 0.2, metalness: 0.8, roughness: 0.3 }));
  c.position.copy(pos);
  c.rotation.z = Math.PI / 2;
  scene.add(c);
  return { m: c, vx: sideDir.x * (0.8 + Math.random() * 0.8), vy: 1.2 + Math.random() * 1.2, vz: sideDir.z * (0.8 + Math.random() * 0.8), rx: (Math.random() - 0.5) * 10, rz: (Math.random() - 0.5) * 10, ground: false };
}

export function stageStreetShot({ app, state, player }) {
  const scene = app.scene;
  const glowTex = makeGlowTexture(128);

  // pick a Glasswater Heights road/block
  const b = state.world.blocks.find(bl => (bl.district === 'heights' || bl.districtName === 'Glasswater Heights') && bl.i >= 7)
    || state.world.blocks.find(bl => bl.districtName === 'Glasswater Heights')
    || state.world.blocks.find(bl => bl.i >= 7 && bl.j >= 5) || state.world.blocks[0];

  const roadOffset = (state.world.layout.roadWidth || 14) * 0.5 + 2.2;
  const hx = b.x - b.size / 2 - roadOffset; // on west road of block
  const hz = b.z - 6;
  const faceYaw = Math.PI / 2; // hero faces +x toward action

  state.mode = 'shot';
  state.player.inCar = null; state.car = null;
  state.player.health = 64; state.player.armour = 40;
  state.player.wanted = 2; state.player.money = 7840; state.player.activeWeapon = 4; state.activeWeapon = 4;
  state.player.x = hx; state.player.z = hz; state.player.y = 0; state.player.yaw = faceYaw;
  state.player.action = null; state.player.dead = false;
  state.districtName = 'Glasswater Heights';
  state.timeOfDay = '18:48 Golden Hour';

  if (player && player.model) {
    player.model.visible = true;
    player.model.position.set(hx, 0, hz);
    player.model.rotation.y = faceYaw;
    // aim pose: raise right arm
    const a = player.model.userData.anim;
    if (a) { a.armR.rotation.x = -Math.PI / 2.1; a.armL.rotation.x = -Math.PI / 2.4; a.legL.rotation.x = 0.1; a.legR.rotation.x = -0.1; }
  }

  // Viper SMG prop in hero hands
  const gun = new THREE.Group();
  const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.7), new THREE.MeshStandardMaterial({ color: 0x1a1f24, roughness: 0.4, metalness: 0.6 }));
  gunBody.position.set(0, 0, 0.25);
  const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8), new THREE.MeshStandardMaterial({ color: 0x333, metalness: 0.8, roughness: 0.2 }));
  gunBarrel.rotation.x = Math.PI / 2; gunBarrel.position.set(0, 0.02, 0.72);
  const gunMag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.12), new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.6 }));
  gunMag.position.set(0, -0.18, 0.1);
  gun.add(gunBody, gunBarrel, gunMag);
  gun.position.set(hx + 0.32, 1.28, hz + 0.15);
  gun.rotation.y = faceYaw;
  scene.add(gun);

  state.rank = { name: 'Wheelman', xp: 1820, next: 3500 };
  state.mission = { number: 5, act: 'ACT II', title: 'Glasswater Job', stage: 2, stageTotal: 4, objective: 'Take out the SHP blockade', next: 'Reach the getaway car', highlight: 'SHP blockade' };
  state.dialogue = { visible: true, speaker: 'Teo "Wrench" Okafor', role: 'Mechanic', text: "Keep your head down, Rio! Drop those SHP officers and punch through that cruiser—I'll keep the engine hot!", seed: 'Teo "Wrench" Okafor' };
  state.radio = { station: 'KRUSH 94.2', genre: 'Synth Nights', track: 'Neon Runway', visible: true };

  const sirens = [];
  // SHP cruiser as blockade ahead (light bar on)
  const cruiser = createCar(scene, { x: hx + 14, z: hz - 1.8, yaw: -Math.PI / 2 + 0.4, type: 'police', color: '#f3f4f6', name: 'SHP Cruiser', driver: 'police' });
  cruiser.speed = 0; cruiser.damage = 0.15;
  state.cars.push(cruiser);
  sirens.push(addSirenLights(cruiser, 0.2));

  // Two SHP officers on foot behind cruiser shooting back
  const officerA = createPedestrianModel(() => 0.1);
  const officerB = createPedestrianModel(() => 0.2);
  [officerA, officerB].forEach(m => m.traverse(o => { if (o.isMesh && o.material && o.material.color) { o.material.color.setHex(0x1e3a8a); } }));
  officerA.position.set(hx + 12.4, 0.15, hz - 3.2); officerA.rotation.y = -Math.PI / 2 - 0.2;
  officerB.position.set(hx + 12.8, 0.15, hz - 0.2); officerB.rotation.y = -Math.PI / 2 + 0.2;
  // aiming pose
  [officerA, officerB].forEach(m => { const a = m.userData.anim; if (a) { a.armR.rotation.x = -Math.PI / 2.2; a.armL.rotation.x = -Math.PI / 2.5; a.legL.rotation.x = 0.25; a.legR.rotation.x = -0.2; } });
  scene.add(officerA, officerB);
  // officer guns
  const makeSmallGun = (x, y, z, yaw) => { const g = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.45), new THREE.MeshStandardMaterial({ color: 0x222, metalness: 0.6, roughness: 0.4 })); g.position.set(x,y,z); g.rotation.y = yaw; scene.add(g); return g; };
  makeSmallGun(hx + 12.0, 1.18, hz - 3.15, -Math.PI / 2);
  makeSmallGun(hx + 12.35, 1.18, hz - 0.15, -Math.PI / 2);

  // Pedestrians running away in panic
  const panicPeds = [];
  const rng = (a,b,seed) => a + (((Math.sin(seed*999.1)+1)/2) * (b-a));
  for (let i = 0; i < 7; i++) {
    const pm = createPedestrianModel(() => ((i * 37) % 100) / 100);
    const px = hx + 4 + rng(-1, 10, i + 1);
    const pz = hz + rng(-8, 8, i + 11);
    const dir = Math.atan2(pz - hz, px - hx) + (i % 2 ? 0.6 : -0.6);
    pm.position.set(px, 0.15, pz); pm.rotation.y = dir;
    scene.add(pm);
    panicPeds.push({ m: pm, x: px, z: pz, dir, speed: 3.2 + (i % 3) * 0.4, t: i * 0.2 });
  }

  // Traffic cars stopped with one smoking
  const stop1 = createCar(scene, { x: hx - 10, z: hz + 3.4, yaw: Math.PI / 2, type: 'sedan', color: '#5c6672', name: 'Sedan', driver: 'npc' });
  stop1.speed = 0; state.cars.push(stop1);
  const stop2 = createCar(scene, { x: hx - 18, z: hz + 3.2, yaw: Math.PI / 2, type: 'van', color: '#8aa0b8', name: 'Van', driver: 'npc' });
  stop2.speed = 0; state.cars.push(stop2);
  const smokingCar = createCar(scene, { x: hx + 20, z: hz - 3.6, yaw: -Math.PI / 2 + 0.1, type: 'sedan', color: '#3a3f46', name: 'Sedan', driver: 'npc' });
  smokingCar.speed = 0; smokingCar.damage = 0.85; smokingCar.dead = false; state.cars.push(smokingCar);
  const smokes = [];
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.5 + i * 0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0x555555, transparent: true, opacity: 0.28 - i * 0.03, roughness: 1, depthWrite: false }));
    s.position.set(smokingCar.mesh.position.x - 0.5 + (i % 2) * 0.6, 1.2 + i * 0.7, smokingCar.mesh.position.z - 0.2);
    scene.add(s);
    smokes.push({ m: s, baseY: s.position.y, t: i * 0.3 });
  }

  // Muzzle flashes and tracers (hero + officers)
  const muzzlePosHero = new THREE.Vector3(hx + 0.45, 1.3, hz + 0.85);
  const heroDir = new THREE.Vector3(1, -0.02, -0.05).normalize();
  const mfHero = makeMuzzleFlash(scene, muzzlePosHero, heroDir, glowTex);
  makeTracer(scene, muzzlePosHero.clone().addScaledVector(heroDir, 0.6), new THREE.Vector3(hx + 12.2, 1.25, hz - 3.0), 0xfff3a0);
  makeTracer(scene, muzzlePosHero.clone().addScaledVector(heroDir, 0.6), new THREE.Vector3(hx + 13.0, 1.15, hz - 1.5), 0xfff3a0);

  const offPosA = new THREE.Vector3(hx + 12.0, 1.22, hz - 3.15);
  const offPosB = new THREE.Vector3(hx + 12.35, 1.22, hz - 0.15);
  const offDirA = new THREE.Vector3(-1, 0.02, 0.08).normalize();
  const offDirB = new THREE.Vector3(-1, 0.01, -0.02).normalize();
  const mfA = makeMuzzleFlash(scene, offPosA, offDirA, glowTex);
  const mfB = makeMuzzleFlash(scene, offPosB, offDirB, glowTex);
  makeTracer(scene, offPosA.clone().addScaledVector(offDirA, 0.4), new THREE.Vector3(hx + 2.5, 1.2, hz - 1.2), 0xffcc66);
  makeTracer(scene, offPosB.clone().addScaledVector(offDirB, 0.4), new THREE.Vector3(hx + 3.0, 1.35, hz + 0.4), 0xffcc66);

  // Hit sparks near cruiser/cover and ground
  const sparks = [
    makeHitSpark(scene, new THREE.Vector3(hx + 13.3, 1.1, hz - 1.8), glowTex),
    makeHitSpark(scene, new THREE.Vector3(hx + 11.8, 0.7, hz - 2.6), glowTex),
    makeHitSpark(scene, new THREE.Vector3(hx + 3.4, 0.9, hz + 0.2), glowTex),
  ];

  // Shell casings
  const shells = [];
  const heroRight = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0,1,0), faceYaw);
  for (let i = 0; i < 6; i++) shells.push(makeShell(scene, new THREE.Vector3(hx + 0.25 - i * 0.03, 1.1, hz + 0.1), heroRight));
  for (let i = 0; i < 3; i++) shells.push(makeShell(scene, new THREE.Vector3(hx + 12.1, 1.0, hz - 3.0), new THREE.Vector3(0,0,-1)));
  for (let i = 0; i < 3; i++) shells.push(makeShell(scene, new THREE.Vector3(hx + 12.45, 1.0, hz - 0.3), new THREE.Vector3(0,0,1)));

  // Dispatch list with real units
  state.dispatch = {
    visible: true, stars: 2,
    units: [
      { callSign: 'GULL-21', distance: 22, tag: 'PURSUIT', type: 'cruiser' },
      { callSign: 'GULL-14', distance: 38, tag: 'FLANKING', type: 'cruiser' },
      { callSign: 'MARLIN-2', distance: 64, tag: 'SEARCHING', type: 'interceptor' },
    ],
    more: 0,
  };
  state.minimap = state.minimap || {};
  state.minimap.police = [
    { x: cruiser.mesh.position.x, z: cruiser.mesh.position.z, yaw: cruiser.yaw },
    { x: hx + 30, z: hz + 10, yaw: -Math.PI / 2 },
  ];

  // Over-the-shoulder, slightly low camera (behind-left of hero, looking down street toward +x)
  const camPos = new THREE.Vector3(hx - 2.8, 1.75, hz - 1.9);
  const lookAt = new THREE.Vector3(hx + 12.5, 1.25, hz - 1.6);

  // golden hour warmth
  app.renderer.toneMappingExposure = 1.15;
  const warm = new THREE.DirectionalLight(0xffb060, 0.8);
  warm.position.set(hx - 30, 18, hz - 20);
  warm.target.position.set(hx + 10, 0, hz);
  scene.add(warm); scene.add(warm.target);
  if (scene.fog) { scene.fog.color.lerp(new THREE.Color(0xffd1a0), 0.35); }

  let t = 0;
  return {
    camera: { position: camPos, lookAt, fov: 58 },
    hudExtra: () => ({ timeLabel: '18:48 Golden Hour', prompt: null }),
    update(dt, frames) {
      t += dt;
      // sirens flash
      for (const s of sirens) {
        s.phase += dt * 10;
        const on = Math.sin(s.phase) > 0;
        s.red.material.emissiveIntensity = on ? 2.8 : 0.08;
        s.blue.material.emissiveIntensity = on ? 0.08 : 2.8;
        s.rLight.intensity = on ? 3.2 : 0;
        s.bLight.intensity = on ? 0 : 3.2;
        if (s.glowR) s.glowR.material.opacity = on ? 0.85 : 0.08;
        if (s.glowB) s.glowB.material.opacity = on ? 0.08 : 0.85;
      }
      // muzzle flicker
      const flick = 0.7 + 0.3 * Math.abs(Math.sin(t * 45));
      [mfHero, mfA, mfB].forEach((m, i) => {
        const f = flick * (i === 0 ? 1 : 0.85);
        m.flash.material.opacity = 0.55 * f + (Math.sin(t * 30 + i) > 0.2 ? 0.35 : 0);
        m.flash.scale.setScalar(0.9 + 0.5 * f);
        m.core.visible = m.flash.material.opacity > 0.5;
      });
      // sparks animate
      for (const sp of sparks) {
        sp.t += dt;
        sp.s.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(t * 20 + sp.s.position.x));
        for (const b of sp.bits) {
          b.vy -= 6 * dt; b.m.position.x += b.vx * dt; b.m.position.y += b.vy * dt; b.m.position.z += b.vz * dt;
          if (b.m.position.y < 0.05) { b.m.position.y = 0.05; b.vy *= -0.3; b.vx *= 0.6; b.vz *= 0.6; }
        }
      }
      // shell casings physics
      for (const c of shells) {
        if (c.ground) continue;
        c.vy -= 9 * dt; c.m.position.x += c.vx * dt; c.m.position.y += c.vy * dt; c.m.position.z += c.vz * dt;
        c.m.rotation.x += c.rx * dt; c.m.rotation.z += c.rz * dt;
        c.vx *= 0.99; c.vz *= 0.99;
        if (c.m.position.y < 0.03) { c.m.position.y = 0.03; c.ground = true; c.m.rotation.x = Math.PI / 2; }
      }
      // panic peds run away
      for (const p of panicPeds) {
        p.t += dt;
        p.x += Math.sin(p.dir) * p.speed * dt;
        p.z += Math.cos(p.dir) * p.speed * dt;
        p.m.position.set(p.x, 0.15, p.z);
        p.m.rotation.y = p.dir;
        const a = p.m.userData.anim;
        if (a) {
          a.t += dt * 11;
          const s = Math.sin(a.t) * 0.7;
          a.legL.rotation.x = s; a.legR.rotation.x = -s; a.armL.rotation.x = -s; a.armR.rotation.x = s;
        }
      }
      // smoke rise
      for (const s of smokes) {
        s.t += dt;
        s.m.position.y = s.baseY + (s.t % 2.5) * 0.6;
        s.m.position.x += Math.sin(t * 0.7 + s.baseY) * 0.002;
        s.m.material.opacity = Math.max(0.05, 0.28 - (s.t % 2.5) * 0.08);
        s.m.scale.setScalar(1 + (s.t % 2.5) * 0.25);
      }
      // keep key state stable each frame
      state.mission = { number: 5, act: 'ACT II', title: 'Glasswater Job', stage: 2, stageTotal: 4, objective: 'Take out the SHP blockade', next: 'Reach the getaway car', highlight: 'SHP blockade' };
      state.dialogue = { visible: true, speaker: 'Teo "Wrench" Okafor', role: 'Mechanic', text: "Keep your head down, Rio! Drop those SHP officers and punch through that cruiser—I'll keep the engine hot!", seed: 'Teo "Wrench" Okafor' };
      state.player.health = 64; state.player.armour = 40; state.player.wanted = 2; state.player.activeWeapon = 4;
      state.dispatch.visible = true; state.dispatch.stars = 2;
      if (player && player.model) {
        player.model.position.set(hx, 0, hz);
        player.model.rotation.y = faceYaw;
      }
      gun.position.set(hx + 0.32, 1.28, hz + 0.15);
      gun.rotation.y = faceYaw;
    },
  };
}
