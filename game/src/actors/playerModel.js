// Creates a simple procedural humanoid model for the player character.
import * as THREE from 'three';

export function createPlayerModel() {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xc98a5a, roughness: 0.8 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0x1f7a8c, roughness: 0.9 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x2f3542, roughness: 0.95 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.8 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.35), shirt);
  torso.position.y = 1.35;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.38), skin);
  head.position.y = 2.05;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.4), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  hair.position.y = 2.3;
  group.add(hair);

  function limb(w, h, d, mat, x, y) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, 0);
    m.castShadow = true;
    group.add(m);
    return m;
  }
  const armL = limb(0.18, 0.75, 0.18, skin, -0.48, 1.3);
  const armR = limb(0.18, 0.75, 0.18, skin, 0.48, 1.3);
  const legL = limb(0.22, 0.85, 0.22, pants, -0.18, 0.55);
  const legR = limb(0.22, 0.85, 0.22, pants, 0.18, 0.55);
  const shoeL = limb(0.24, 0.16, 0.34, shoe, -0.18, 0.08);
  const shoeR = limb(0.24, 0.16, 0.34, shoe, 0.18, 0.08);
  shoeL.position.z = shoeR.position.z = 0.06;

  group.userData.anim = { armL, armR, legL, legR, t: 0 };
  group.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  return group;
}

export function animatePlayerModel(model, moving, speed, dt) {
  const a = model.userData.anim;
  a.t += dt * (moving ? 6 + speed * 0.4 : 2);
  const swing = moving ? Math.sin(a.t) * 0.5 : Math.sin(a.t) * 0.05;
  a.legL.rotation.x = swing;
  a.legR.rotation.x = -swing;
  a.armL.rotation.x = -swing * 0.8;
  a.armR.rotation.x = swing * 0.8;
  if (!moving) {
    model.position.y = Math.sin(a.t * 0.5) * 0.01;
  }
}
