// Police helicopter HERON-1 with spinning rotors and spotlight that follows the player.
import * as THREE from 'three';

export function createHelicopter(scene, state, callSign = 'HERON-1') {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.2 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 4.6), bodyMat);
  body.castShadow = true; g.add(body);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 3.4), bodyMat);
  tail.position.set(0, 0.15, -3.6); g.add(tail);
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.06, 0.35), new THREE.MeshStandardMaterial({ color: 0x222 }));
  rotor.position.y = 0.9; g.add(rotor);
  const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.2), new THREE.MeshStandardMaterial({ color: 0x222 }));
  tailRotor.position.set(0.3, 0.2, -5.1); g.add(tailRotor);
  const spot = new THREE.SpotLight(0xffffff, 18, 160, Math.PI / 9, 0.35, 1);
  spot.position.set(0, -0.4, 1.4);
  spot.castShadow = false;
  g.add(spot); g.add(spot.target);
  g.position.set(state.player.x + 10, 22, state.player.z - 20);
  scene.add(g);

  return {
    mesh: g, callSign, rotor, tailRotor, spot,
    update(dt, state) {
      const tx = state.player.x, tz = state.player.z;
      const dx = tx - g.position.x, dz = tz - g.position.z;
      const d = Math.hypot(dx, dz) || 1;
      const desiredX = tx - dx / d * 18 + 6;
      const desiredZ = tz - dz / d * 18 - 10;
      g.position.x += (desiredX - g.position.x) * Math.min(1, dt * 1.2);
      g.position.z += (desiredZ - g.position.z) * Math.min(1, dt * 1.2);
      g.position.y += (22 - g.position.y) * Math.min(1, dt * 1.5);
      g.rotation.y = Math.atan2(dx, dz);
      rotor.rotation.y += dt * 22;
      tailRotor.rotation.x += dt * 28;
      spot.target.position.set(tx, 0.5, tz);
      spot.target.updateMatrixWorld();
    },
    remove(scene) { scene.remove(g); },
  };
}
