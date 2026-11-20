// Builds the police cruiser vehicle mesh variant.
import * as THREE from 'three';

export function buildPolice(g, bodyMat, glass, dark) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.2, 4.3), bodyMat);
  body.position.y = 0.95; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.7, 1.8), glass);
  cab.position.set(0, 1.58, -0.1); cab.castShadow = true; g.add(cab);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 0.34), dark);
  bar.position.set(0, 2.02, -0.1); g.add(bar);
  const red = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), new THREE.MeshStandardMaterial({ color: 0xff3355, emissive: 0xff2244, emissiveIntensity: 0.8 }));
  red.position.set(-0.3, 2.16, -0.1); g.add(red);
  const blue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), new THREE.MeshStandardMaterial({ color: 0x3388ff, emissive: 0x2266ff, emissiveIntensity: 0.8 }));
  blue.position.set(0.3, 2.16, -0.1); g.add(blue);
  const push = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 0.15), new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.6, metalness: 0.4 }));
  push.position.set(0, 0.55, 2.2); g.add(push);
  return { len: 4.3, wid: 1.95, h: 1.2 };
}
