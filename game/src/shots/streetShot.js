// Stages the street screenshot: Rio on foot on a sunlit Port Solenne boulevard.
import * as THREE from 'three';

export function stageStreetShot({ state, app }) {
  state.player.inCar = null;
  state.car = null;
  state.hud.mission = 'First Light in Port Solenne';
  state.hud.objective = 'Meet Mama Inés at the diner. Keep your head down on Marigold Beach.';
  state.player.money = 240;
  state.player.health = 100;
  state.player.wanted = 0;

  // place player on a boulevard near beach with view toward city and palms
  const b = state.world.blocks.find(bl => bl.district === 'beach' && bl.i === 5 && bl.j === 10) || state.world.blocks[Math.floor(state.world.blocks.length * 0.7)];
  state.player.x = b.x + b.size / 2 + 6;
  state.player.z = b.z - 6;
  state.player.y = 0;
  state.player.yaw = -Math.PI * 0.35;
  state.districtName = b.districtName;

  // cinematic camera behind/right of player looking down street toward pastel skyline
  const camPos = new THREE.Vector3(state.player.x + 4.5, 3.2, state.player.z + 7.5);
  const lookAt = new THREE.Vector3(state.player.x - 10, 2.0, state.player.z - 18);

  return {
    camera: { position: camPos, lookAt, fov: 58 },
    hudExtra: () => ({ timeLabel: '18:42 Golden Hour', prompt: null }),
    update() {
      // subtle idle placement
    },
  };
}
