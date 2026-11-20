// Creates a simple procedural pedestrian character with varied appearance.
import * as THREE from 'three';

export function createPedestrianModel(rng) {
  const g = new THREE.Group();
  const skins = [0xd9a066, 0xc68642, 0x8d5524, 0xf1c27d, 0xe0ac69, 0x6f4e37];
  const shirts = [0xff6b6b, 0x4dabf7, 0x51cf66, 0xffd43b, 0xf06595, 0x845ef7, 0xffffff, 0x20c997];
  const pants = [0x2f3542, 0x495057, 0x1f3b73, 0x5c4033, 0x334155];
  const skin = new THREE.MeshStandardMaterial({ color: skins[Math.floor(rng() * skins.length)], roughness: 0.85 });
  const shirt = new THREE.MeshStandardMaterial({ color: shirts[Math.floor(rng() * shirts.length)], roughness: 0.9 });
  const pant = new THREE.MeshStandardMaterial({ color: pants[Math.floor(rng() * pants.length)], roughness: 0.95 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.28), shirt);
  torso.position.y = 1.2; torso.castShadow = true; g.add(torso);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), skin);
  head.position.y = 1.78; head.castShadow = true; g.add(head);
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.34), new THREE.MeshStandardMaterial({ color: rng() < 0.5 ? 0x1a1a1a : 0x5a3825 }));
  hair.position.y = 1.99; g.add(hair);
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.18), pant); legL.position.set(-0.14, 0.48, 0); legL.castShadow = true; g.add(legL);
  const legR = legL.clone(); legR.position.x = 0.14; g.add(legR);
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 0.14), skin); armL.position.set(-0.38, 1.15, 0); g.add(armL);
  const armR = armL.clone(); armR.position.x = 0.38; g.add(armR);
  g.userData.anim = { t: rng() * Math.PI * 2, legL, legR, armL, armR };
  return g;
}

export function animatePedestrian(model, dt, speed, fleeing) {
  const a = model.userData.anim; if (!a) return;
  a.t += dt * (fleeing ? 10 : 4 + speed * 0.5);
  const s = Math.sin(a.t) * (fleeing ? 0.7 : 0.4);
  a.legL.rotation.x = s; a.legR.rotation.x = -s;
  a.armL.rotation.x = -s * 0.8; a.armR.rotation.x = s * 0.8;
}
