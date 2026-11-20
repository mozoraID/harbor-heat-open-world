// Builds the pickup truck vehicle mesh variant.
import * as THREE from 'three';

export function buildPickup(g, bodyMat, glass, dark) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 4.7), bodyMat);
  body.position.y = 0.95; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.75, 1.5), glass);
  cab.position.set(0, 1.65, 0.7); cab.castShadow = true; g.add(cab);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 1.7), new THREE.MeshStandardMaterial({ color: 0x555, roughness: 0.85 }));
  bed.position.set(0, 1.0, -1.2); bed.castShadow = true; g.add(bed);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.75), dark); rail.position.set(0, 1.32, -1.2); g.add(rail);
  return { len: 4.7, wid: 2.0, h: 1.2 };
}
