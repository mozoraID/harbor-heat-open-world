// Stages the street screenshot: Rio on foot on a palm-lined boulevard toward the sea.
import * as THREE from 'three';

export function stageStreetShot({ state, player }) {
  state.player.inCar = null;
  state.car = null;
  state.hud.mission = 'First Light in Port Solenne';
  state.hud.objective = 'Meet Mama Inés at Pier 9 Diner. Keep your head down on Marigold Beach.';
  state.player.money = 240;
  state.player.health = 100;
  state.player.wanted = 0;

  const b = state.world.blocks.find(bl => bl.district === 'beach' && bl.i === 6 && bl.j === 10)
    || state.world.blocks.find(bl => bl.district === 'beach')
    || state.world.blocks[0];
  state.player.x = b.x + b.size / 2 + 6.8;
  state.player.z = b.z - 4;
  state.player.y = 0;
  state.player.yaw = 0;
  state.camera.yaw = Math.PI;
  state.camera.pitch = 0.16;
  state.districtName = b.districtName || 'Marigold Beach';

  if (player && player.model) {
    player.model.visible = true;
    player.model.position.set(state.player.x, 0, state.player.z);
    player.model.rotation.y = state.player.yaw;
  }

  const camPos = new THREE.Vector3(state.player.x + 0.6, 2.1, state.player.z - 4.0);
  const lookAt = new THREE.Vector3(state.player.x, 1.45, state.player.z + 16);

  return {
    camera: { position: camPos, lookAt, fov: 60 },
    hudExtra: () => ({ timeLabel: '18:42 Golden Hour', prompt: null }),
  };
}
