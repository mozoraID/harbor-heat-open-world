// Builds the taxi vehicle mesh variant.
import * as THREE from 'three';

export function buildTaxi(g, bodyMat, glass, dark) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.2, 4.2), bodyMat);
  body.position.y = 0.95; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.72, 1.8), glass);
  cab.position.set(0, 1.58, -0.15); cab.castShadow = true; g.add(cab);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.28), new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffcc33, emissiveIntensity: 0.5 }));
  sign.position.set(0, 2.05, -0.2); g.add(sign);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.12, 1.2), new THREE.MeshStandardMaterial({ color: 0x111 }));
  stripe.position.set(0, 0.8, 0); g.add(stripe);
  return { len: 4.2, wid: 1.9, h: 1.2 };
}
