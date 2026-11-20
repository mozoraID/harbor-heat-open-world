// Builds the van vehicle mesh variant.
import * as THREE from 'three';

export function buildVan(g, bodyMat, glass, dark) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.7, 4.6), bodyMat);
  body.position.y = 1.2; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.9, 1.6), glass);
  cab.position.set(0, 2.0, 1.0); cab.castShadow = true; g.add(cab);
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.15, 0.4), dark); step.position.set(0, 0.35, 1.9); g.add(step);
  return { len: 4.6, wid: 2.0, h: 1.7 };
}
