// Builds the sedan vehicle mesh variant.
import * as THREE from 'three';

export function buildSedan(g, bodyMat, glass, dark) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.15, 4.2), bodyMat);
  body.position.y = 0.95; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 1.9), glass);
  cab.position.set(0, 1.55, -0.1); cab.castShadow = true; g.add(cab);
  const bumperF = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.3, 0.2), dark); bumperF.position.set(0, 0.45, 2.1); g.add(bumperF);
  const bumperR = bumperF.clone(); bumperR.position.z = -2.1; g.add(bumperR);
  return { len: 4.2, wid: 1.9, h: 1.15 };
}
