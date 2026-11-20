// Builds the sports coupe vehicle mesh variant.
import * as THREE from 'three';

export function buildSports(g, bodyMat, glass, dark) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.78, 4.6), bodyMat);
  body.position.y = 0.72; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.38, 0.9), bodyMat);
  nose.position.set(0, 0.5, 1.9); nose.castShadow = true; g.add(nose);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.42, 0.7), bodyMat);
  tail.position.set(0, 0.58, -1.95); tail.castShadow = true; g.add(tail);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.5, 1.3), glass);
  cab.position.set(0, 1.16, -0.35); cab.castShadow = true; g.add(cab);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 4.55), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.05 }));
  stripe.position.set(0, 1.12, 0.02); g.add(stripe);
  const hoodStripe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 1.5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 }));
  hoodStripe.position.set(0, 0.92, 1.55); g.add(hoodStripe);
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.08, 0.4), dark);
  spoiler.position.set(0, 1.22, -2.18); g.add(spoiler);
  const standL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.1), dark); standL.position.set(-0.55, 1.04, -2.08); g.add(standL);
  const standR = standL.clone(); standR.position.x = 0.55; g.add(standR);
  const intake = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.16, 0.12), dark);
  intake.position.set(0, 0.4, 2.36); g.add(intake);
  const skirtL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 3.4), dark); skirtL.position.set(-1.08, 0.4, 0); g.add(skirtL);
  const skirtR = skirtL.clone(); skirtR.position.x = 1.08; g.add(skirtR);
  const headL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.05), new THREE.MeshStandardMaterial({ color: 0xfff6cf, emissive: 0xfff0b0, emissiveIntensity: 0.7 }));
  headL.position.set(-0.55, 0.62, 2.33); g.add(headL);
  const headR = headL.clone(); headR.position.x = 0.55; g.add(headR);
  return { len: 4.6, wid: 2.1, h: 0.78 };
}
