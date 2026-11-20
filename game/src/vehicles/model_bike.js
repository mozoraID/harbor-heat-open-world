// Builds the motorbike vehicle mesh variant.
import * as THREE from 'three';

export function buildBike(g, bodyMat, glass, dark) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 2.2), bodyMat);
  frame.position.y = 0.8; frame.castShadow = true; g.add(frame);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.7), new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.9 }));
  seat.position.set(0, 1.05, -0.25); g.add(seat);
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.7), bodyMat);
  tank.position.set(0, 1.05, 0.25); g.add(tank);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.08), dark); bar.position.set(0, 1.2, 0.8); g.add(bar);
  return { len: 2.2, wid: 0.8, h: 1.0 };
}