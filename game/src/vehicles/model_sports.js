// Builds the sports coupe vehicle mesh variant.
import * as THREE from 'three';

export function buildSports(g, bodyMat, glass, dark) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.95, 4.4), bodyMat);
  body.position.y = 0.8; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.55, 1.4), glass);
  cab.position.set(0, 1.35, -0.3); cab.castShadow = true; g.add(cab);
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.35), dark);
  spoiler.position.set(0, 1.3, -2.05); g.add(spoiler);
  const intake = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.15), dark);
  intake.position.set(0, 0.45, 2.15); g.add(intake);
  return { len: 4.4, wid: 1.95, h: 0.95 };
}
