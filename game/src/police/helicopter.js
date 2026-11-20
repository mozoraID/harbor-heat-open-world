// Police helicopter HERON-1 with spinning rotors and spotlight that follows the player.
import * as THREE from 'three';

function shpTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e5e7eb'; ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0, 44, 256, 40);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('SHP', 128, 74);
  ctx.fillStyle = '#dbeafe'; ctx.font = 'bold 18px sans-serif'; ctx.fillText('AIR UNIT', 128, 104);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createHelicopter(scene, state, callSign = 'HERON-1') {
  const g = new THREE.Group();
  const blue = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.45, metalness: 0.2 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5, metalness: 0.15 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.25, 5.0), blue);
  body.castShadow = true; g.add(body);
  const belly = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 3.8), white);
  belly.position.set(0, -0.55, 0.2); g.add(belly);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 1.2), blue);
  nose.position.set(0, -0.05, 2.8); g.add(nose);
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.7, 1.6), new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.2 }));
  canopy.position.set(0, 0.35, 2.2); g.add(canopy);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 4.2), blue);
  tail.position.set(0, 0.2, -4.2); g.add(tail);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 1.2), white);
  fin.position.set(0, 0.8, -5.6); g.add(fin);
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), new THREE.MeshStandardMaterial({ map: shpTexture(), transparent: true, side: THREE.DoubleSide }));
  badge.position.set(1.41, 0.0, 0.2); badge.rotation.y = Math.PI / 2; g.add(badge);
  const badge2 = badge.clone(); badge2.position.set(-1.41, 0.0, 0.2); badge2.rotation.y = -Math.PI / 2; g.add(badge2);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
  mast.position.y = 0.9; g.add(mast);
  const rotor = new THREE.Group();
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6, metalness: 0.2 });
  const blade1 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.06, 0.45), bladeMat);
  const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 10.5), bladeMat);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(5.2, 32), new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = -0.01;
  rotor.add(blade1, blade2, disc);
  rotor.position.y = 1.2; g.add(rotor);

  const tailRotor = new THREE.Group();
  const tb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.22), bladeMat);
  const tb2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 1.8), bladeMat);
  tailRotor.add(tb, tb2);
  tailRotor.position.set(0.32, 0.8, -5.8); g.add(tailRotor);

  const skidMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.7 });
  const skidL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 3.0), skidMat); skidL.position.set(-0.9, -0.95, 0.2); g.add(skidL);
  const skidR = skidL.clone(); skidR.position.x = 0.9; g.add(skidR);

  const spot = new THREE.SpotLight(0xffffff, 28, 220, Math.PI / 9, 0.3, 1);
  spot.position.set(0, -0.55, 1.6);
  spot.castShadow = false;
  g.add(spot); g.add(spot.target);

  g.position.set(state.player.x + 20, 18, state.player.z - 10);
  scene.add(g);

  return {
    mesh: g, callSign, rotor, tailRotor, spot,
    update(dt, state) {
      const tx = state.player.x, tz = state.player.z;
      const dx = tx - g.position.x, dz = tz - g.position.z;
      const d = Math.hypot(dx, dz) || 1;
      const desiredX = tx - dx / d * 18 + 6;
      const desiredZ = tz - dz / d * 18 - 8;
      g.position.x += (desiredX - g.position.x) * Math.min(1, dt * 1.2);
      g.position.z += (desiredZ - g.position.z) * Math.min(1, dt * 1.2);
      g.position.y += (18 - g.position.y) * Math.min(1, dt * 1.5);
      g.rotation.y = Math.atan2(dx, dz);
      rotor.rotation.y += dt * 24;
      tailRotor.rotation.x += dt * 30;
      spot.target.position.set(tx, 0.5, tz);
      spot.target.updateMatrixWorld();
    },
    remove(scene) { scene.remove(g); },
  };
}
