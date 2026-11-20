// Stages the chase screenshot: a dramatic police pursuit on the beach boulevard at sunset.
import * as THREE from 'three';
import { createCar } from '../vehicles/car.js';

function addLightBar(carMesh, colorA, colorB) {
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.28), new THREE.MeshStandardMaterial({ color: colorA, emissive: colorA, emissiveIntensity: 1.2 }));
  a.position.set(-0.28, 2.0, -0.1);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.28), new THREE.MeshStandardMaterial({ color: colorB, emissive: colorB, emissiveIntensity: 1.2 }));
  b.position.set(0.28, 2.0, -0.1);
  carMesh.add(a); carMesh.add(b);
}

export function stageChaseShot({ app, state }) {
  state.hud.mission = 'Act I: Breakwater Run';
  state.hud.objective = 'Lose Solenne Harbor Patrol and reach the Lagoon Bridge safehouse.';
  state.player.money = 1850;
  state.player.health = 78;
  state.player.armour = 25;
  state.player.wanted = 4;

  // hero car on beach boulevard
  const hero = createCar(app.scene, { x: 18, z: state.world.layout.depth / 2 - 28, yaw: Math.PI * 0.98, type: 'sports', color: '#ff4d6d', name: 'Vanta Coupe', maxSpeed: 31 });
  hero.speed = 22;
  state.cars.push(hero);
  state.car = hero;
  state.player.inCar = hero;
  hero.driver = 'player';

  // police cruisers behind
  const p1 = createCar(app.scene, { x: 22, z: state.world.layout.depth / 2 - 16, yaw: Math.PI * 1.02, type: 'police', color: '#1f2937', name: 'SHP Cruiser', maxSpeed: 28 });
  const p2 = createCar(app.scene, { x: 12, z: state.world.layout.depth / 2 - 8, yaw: Math.PI * 0.95, type: 'police', color: '#1f2937', name: 'SHP Cruiser', maxSpeed: 28 });
  state.cars.push(p1, p2);
  addLightBar(p1.mesh, 0xff3355, 0x3388ff);
  addLightBar(p2.mesh, 0x3388ff, 0xff3355);

  // roadblock cones ahead
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xff7a00, emissive: 0xff6600, emissiveIntensity: 0.2 });
  for (let i = 0; i < 6; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 8), coneMat);
    cone.position.set(8 + i * 2.2, 0.45, state.world.layout.depth / 2 - 48);
    cone.castShadow = true;
    app.scene.add(cone);
  }

  // helicopter stand-in
  const heli = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 4.2), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.2 }));
  body.castShadow = true; heli.add(body);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 3.0), new THREE.MeshStandardMaterial({ color: 0x334155 }));
  tail.position.set(0, 0.1, -3.2); heli.add(tail);
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(7, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0x222 }));
  rotor.position.y = 0.8; heli.add(rotor);
  const spot = new THREE.SpotLight(0xffffff, 12, 120, Math.PI / 8, 0.4, 1);
  spot.position.set(0, -0.2, 1.5);
  spot.target.position.set(18, 0, state.world.layout.depth / 2 - 28);
  heli.add(spot); heli.add(spot.target);
  heli.position.set(5, 18, state.world.layout.depth / 2 - 35);
  heli.rotation.y = Math.PI * 0.1;
  app.scene.add(heli);

  // explosion visual
  const exp = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffcc55, emissive: 0xff6600, emissiveIntensity: 1.5, transparent: true, opacity: 0.9 }));
  exp.position.set(28, 1.2, state.world.layout.depth / 2 - 40);
  app.scene.add(exp);
  const smoke = new THREE.Mesh(new THREE.SphereGeometry(3.2, 10, 10), new THREE.MeshStandardMaterial({ color: 0x444, transparent: true, opacity: 0.55 }));
  smoke.position.set(28, 3.2, state.world.layout.depth / 2 - 40);
  app.scene.add(smoke);

  state.districtName = 'Marigold Beach';

  const camPos = new THREE.Vector3(30, 5.5, state.world.layout.depth / 2 - 6);
  const lookAt = new THREE.Vector3(14, 1.4, state.world.layout.depth / 2 - 32);

  // enrich HUD with dispatch-like objective text for this staged shot
  state.hud.objective = 'Evade 4★ SHP pursuit · GULL-11 RAMMING (18m) · GULL-12 FLANKING (32m) · BULWARK ROADBLOCK AHEAD · HERON-1 SPOTLIGHT';

  return {
    camera: { position: camPos, lookAt, fov: 62 },
    hudExtra: () => ({ timeLabel: '19:08 Golden Hour', prompt: null }),
    update(dt, frame) {
      rotor.rotation.y += dt * 20;
      const pulse = 0.5 + Math.sin(frame * 0.4) * 0.5;
      exp.material.emissiveIntensity = 1.2 + pulse;
      exp.scale.setScalar(1 + pulse * 0.08);
    },
  };
}
