// Spawns a BULWARK roadblock of armoured trucks and cones ahead of the player.
import * as THREE from 'three';
import { createCar } from '../vehicles/car.js';

export function createRoadblock(scene, state, callSign = 'BULWARK-1') {
  const yaw = (state.car ? state.car.yaw : state.player.yaw) || 0;
  const dist = 55;
  const cx = state.player.x + Math.sin(yaw) * dist;
  const cz = state.player.z + Math.cos(yaw) * dist;
  const px = Math.cos(yaw), pz = -Math.sin(yaw);
  const group = new THREE.Group();
  const t1 = createCar(scene, { x: cx - px * 3.2, z: cz - pz * 3.2, yaw: yaw + Math.PI / 2, type: 'armoured', color: '#39424e', name: 'BULWARK Truck', maxSpeed: 21, driver: 'police' });
  const t2 = createCar(scene, { x: cx + px * 3.2, z: cz + pz * 3.2, yaw: yaw - Math.PI / 2, type: 'armoured', color: '#39424e', name: 'BULWARK Truck', maxSpeed: 21, driver: 'police' });
  group.add(t1.mesh); group.add(t2.mesh);
  // t1/t2 meshes already added by createCar; avoid double-add but keep refs
  scene.add(group);
  const cones = [];
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xff7a00, emissive: 0xff6600, emissiveIntensity: 0.25 });
  for (let i = -3; i <= 3; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 8), coneMat);
    cone.position.set(cx + px * i * 1.4 + Math.sin(yaw) * 2.5, 0.45, cz + pz * i * 1.4 + Math.cos(yaw) * 2.5);
    cone.castShadow = true; scene.add(cone); cones.push(cone);
  }
  return {
    callSign, x: cx, z: cz, trucks: [t1, t2], cones, group,
    update() {},
    remove(scene) {
      for (const c of cones) scene.remove(c);
      scene.remove(group);
      // trucks remain in world visually; simple cleanup
    },
  };
}
