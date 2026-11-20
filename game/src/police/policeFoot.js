// Police officers on foot that can exit cars and perform simple shooting behavior.
import * as THREE from 'three';
import { createPedestrianModel } from '../actors/pedestrianModel.js';

export function createPoliceOfficer(scene, x, z) {
  const m = createPedestrianModel({ rng: () => 0.2 });
  m.traverse(o => { if (o.isMesh && o.material && o.material.color) o.material.color.setHex(0x1f3b73); });
  m.position.set(x, 0.15, z);
  scene.add(m);
  return { model: m, x, z, cooldown: 0, update(dt, state) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    const dx = state.player.x - this.x, dz = state.player.z - this.z;
    const d = Math.hypot(dx, dz) || 1;
    this.model.rotation.y = Math.atan2(dx, dz);
    if (d < 30 && this.cooldown <= 0) {
      this.cooldown = 1.2;
      state.player.health = Math.max(0, state.player.health - 4);
    }
  }, remove(scene){ scene.remove(m); } };
}
