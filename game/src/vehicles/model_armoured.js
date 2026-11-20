// Builds the armoured truck vehicle mesh variant.
import * as THREE from 'three';

export function buildArmoured(g, bodyMat, glass, dark) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 5.2), bodyMat);
  body.position.y = 1.4; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 1.4), glass);
  cab.position.set(0, 2.55, 1.4); cab.castShadow = true; g.add(cab);
  const grill = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.1), dark); grill.position.set(0, 1.2, 2.65); g.add(grill);
  const vents = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.6), dark); vents.position.set(0, 2.5, -1.8); g.add(vents);
  return { len: 5.2, wid: 2.2, h: 2.0 };
}
