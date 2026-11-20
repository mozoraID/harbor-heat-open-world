// Stages the title screenshot with an establishing view of Port Solenne.
import * as THREE from 'three';

export function stageTitleShot({ state }) {
  state.hud.mission = 'Harbor Heat';
  state.hud.objective = 'A Port Solenne story. New Game · Continue · Settings · Controls';
  state.player.money = 0;
  state.districtName = 'Port Solenne';
  const camPos = new THREE.Vector3(80, 60, state.world.layout.depth / 2 + 10);
  const lookAt = new THREE.Vector3(-20, 10, state.world.layout.depth / 2 - 40);
  return {
    camera: { position: camPos, lookAt, fov: 50 },
    hudExtra: () => ({ timeLabel: '18:30 Golden Hour', prompt: 'Press Enter to Start' }),
  };
}
