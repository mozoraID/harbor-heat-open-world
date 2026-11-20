// Stages the chase screenshot: 4-star SHP pursuit on the sunset beach boulevard.
import * as THREE from 'three';
import { createCar } from '../vehicles/car.js';
import { createHelicopter } from '../police/helicopter.js';
import { createCarExplosion } from '../combat/carExplosion.js';

function addSiren(carMesh, phase = 0) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.32), new THREE.MeshStandardMaterial({ color: 0x222 }));
  bar.position.set(0, 2.02, -0.1); carMesh.add(bar);
  const red = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.28), new THREE.MeshStandardMaterial({ color: 0xff3355, emissive: 0xff3355, emissiveIntensity: 1.8 }));
  red.position.set(-0.28, 2.15, -0.1); carMesh.add(red);
  const blue = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.28), new THREE.MeshStandardMaterial({ color: 0x3388ff, emissive: 0x3388ff, emissiveIntensity: 0.2 }));
  blue.position.set(0.28, 2.15, -0.1); carMesh.add(blue);
  return { red, blue, phase };
}

export function stageChaseShot({ app, state, player }) {
  if (player && player.model) player.model.visible = false;
  state.player.money = 4820;
  state.player.health = 76;
  state.player.armour = 25;
  state.player.wanted = 4;
  state.player.activeWeapon = 4;
  state.activeWeapon = 4;
  state.weapons = state.weapons || [];
  state.rank = { name: 'Wheelman', xp: 68, next: 100 };
  state.mission = { number: 3, act: 'ACT I', title: 'Tide Breaker', stage: 3, stageTotal: 4, objective: 'Lose the SHP before the Lagoon Bridge', next: 'Hit the spray shop in Old Pier', highlight: 'Lose' };
  state.radio = { station: 'KRUSH 94.2', genre: 'Synth Nights', track: 'Neon Runway', visible: true };
  state.dialogue = { visible: true, speaker: 'Sasha Lune', role: 'Fixer', text: 'Rio, keep the wheel straight—BULWARK is blocking the boulevard ahead. Cut past it before HERON boxes you in!', seed: 'sasha' };
  state.dispatch = {
    visible: true, stars: 4,
    units: [
      { icon: '🚓', callSign: 'GULL-11', distance: 12, tag: 'RAMMING' },
      { icon: '🚓', callSign: 'GULL-12', distance: 18, tag: 'FLANKING' },
      { icon: '🚓', callSign: 'MARLIN-1', distance: 24, tag: 'PIT' },
      { icon: '🚧', callSign: 'BULWARK-1', distance: 55, tag: 'ROADBLOCK' },
      { icon: '🚁', callSign: 'HERON-1', distance: 38, tag: 'SPOTLIGHT' },
    ],
    more: 0,
  };
  state.wanted = { searching: false, status: 'AIR UNIT OVERHEAD' };
  state.districtName = 'Marigold Beach';

  const hero = createCar(app.scene, { x: 16, z: state.world.layout.depth / 2 - 30, yaw: Math.PI, type: 'sports', color: '#2fd1c5', name: 'Solenne Vortex GT', maxSpeed: 34, driver: 'player' });
  hero.speed = 38.9; // ~140 km/h
  state.cars.push(hero);
  state.car = hero;
  state.player.inCar = hero;
  state.speed = hero.speed;

  const sirens = [];
  const p1 = createCar(app.scene, { x: 20, z: state.world.layout.depth / 2 - 16, yaw: Math.PI * 1.02, type: 'police', color: '#1f2937', name: 'SHP Cruiser', maxSpeed: 30, driver: 'police' });
  const p2 = createCar(app.scene, { x: 11, z: state.world.layout.depth / 2 - 10, yaw: Math.PI * 0.97, type: 'police', color: '#1f2937', name: 'SHP Cruiser', maxSpeed: 30, driver: 'police' });
  const p3 = createCar(app.scene, { x: 16, z: state.world.layout.depth / 2 - 4, yaw: Math.PI, type: 'police', color: '#1f2937', name: 'MARLIN Interceptor', maxSpeed: 31, driver: 'police' });
  const p4 = createCar(app.scene, { x: 24, z: state.world.layout.depth / 2 - 22, yaw: Math.PI * 1.03, type: 'police', color: '#1f2937', name: 'SHP Cruiser', maxSpeed: 30, driver: 'police' });
  [p1, p2, p3, p4].forEach((p, i) => { state.cars.push(p); sirens.push(addSiren(p.mesh, i * 0.7)); });

  // BULWARK roadblock ahead
  const rb1 = createCar(app.scene, { x: 12, z: state.world.layout.depth / 2 - 58, yaw: Math.PI / 2, type: 'armoured', color: '#39424e', name: 'BULWARK Truck', driver: 'police' });
  const rb2 = createCar(app.scene, { x: 20, z: state.world.layout.depth / 2 - 58, yaw: -Math.PI / 2, type: 'armoured', color: '#39424e', name: 'BULWARK Truck', driver: 'police' });
  state.cars.push(rb1, rb2);
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xff7a00, emissive: 0xff6600, emissiveIntensity: 0.25 });
  for (let i = 0; i < 7; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 8), coneMat);
    cone.position.set(10 + i * 1.7, 0.45, state.world.layout.depth / 2 - 54);
    cone.castShadow = true; app.scene.add(cone);
  }

  // HERON-1 helicopter
  const heli = createHelicopter(app.scene, state, 'HERON-1');
  heli.mesh.position.set(8, 20, state.world.layout.depth / 2 - 38);
  heli.spot.target.position.set(hero.mesh.position.x, 0.5, hero.mesh.position.z);

  // burning car explosion at roadside
  const wreck = createCar(app.scene, { x: 28, z: state.world.layout.depth / 2 - 42, yaw: Math.PI * 0.7, type: 'sedan', color: '#555', name: 'Wreck', driver: null });
  wreck.damage = 1; wreck.dead = true;
  state.cars.push(wreck);
  const explosion = createCarExplosion(app.scene, 28, state.world.layout.depth / 2 - 42);

  state.minimap = state.minimap || {};
  state.minimap.police = [
    { x: p1.mesh.position.x, z: p1.mesh.position.z, yaw: p1.mesh.rotation.y },
    { x: p2.mesh.position.x, z: p2.mesh.position.z, yaw: p2.mesh.rotation.y },
    { x: p3.mesh.position.x, z: p3.mesh.position.z, yaw: p3.mesh.rotation.y },
    { x: p4.mesh.position.x, z: p4.mesh.position.z, yaw: p4.mesh.rotation.y },
  ];
  state.minimap.target = { x: 16, z: state.world.layout.depth / 2 - 120 };

  return {
    camera: { position: new THREE.Vector3(14.5, 2.2, state.world.layout.depth / 2 - 22.5), lookAt: new THREE.Vector3(16, 1.1, state.world.layout.depth / 2 - 38), fov: 66 },
    hudExtra: () => ({ timeLabel: '19:08 Golden Hour', prompt: null }),
    update(dt, frame) {
      heli.rotor.rotation.y += dt * 22;
      heli.tailRotor.rotation.x += dt * 28;
      heli.spot.target.position.set(hero.mesh.position.x, 0.5, hero.mesh.position.z);
      heli.spot.target.updateMatrixWorld();
      explosion.update(dt);
      for (const s of sirens) {
        s.phase += dt * 10;
        const on = Math.sin(s.phase) > 0;
        s.red.material.emissiveIntensity = on ? 2.2 : 0.1;
        s.blue.material.emissiveIntensity = on ? 0.1 : 2.2;
      }
    },
  };
}
