// Creates a dramatic burning-car explosion with fireball, smoke, and damage hook.
import * as THREE from 'three';

export function createCarExplosion(scene, x, z) {
  const group = new THREE.Group();
  const fire = new THREE.Mesh(new THREE.SphereGeometry(2.4, 14, 14), new THREE.MeshStandardMaterial({ color: 0xffcc55, emissive: 0xff6600, emissiveIntensity: 1.6, transparent: true, opacity: 0.95 }));
  fire.position.set(x, 1.2, z);
  const smoke = new THREE.Mesh(new THREE.SphereGeometry(3.6, 12, 12), new THREE.MeshStandardMaterial({ color: 0x333, transparent: true, opacity: 0.55 }));
  smoke.position.set(x, 3.4, z);
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.0, 10, 10), new THREE.MeshStandardMaterial({ color: 0xff8844, emissive: 0xff3300, emissiveIntensity: 1.4 }));
  core.position.set(x, 0.8, z);
  group.add(fire, smoke, core);
  scene.add(group);
  return { group, fire, smoke, t: 0, update(dt) { this.t += dt; fire.scale.setScalar(1 + Math.sin(this.t * 8) * 0.08); fire.material.emissiveIntensity = 1.3 + Math.sin(this.t * 10) * 0.4; smoke.position.y += dt * 0.5; smoke.material.opacity = Math.max(0.25, 0.55 - this.t * 0.05); } };
}
