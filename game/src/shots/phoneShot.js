// Stages the phone screenshot: in-game phone UI context over the city.
import * as THREE from 'three';

export function stagePhoneShot({ state, player }) {
  state.player.inCar = null;
  state.car = null;
  if (player && player.model) player.model.visible = true;
  state.hud.mission = 'Contacts & Leads';
  state.hud.objective = 'Sasha Lune: "Kade is moving product tonight at Ferro Docks. You in?"';
  state.player.money = 3120;
  state.districtName = 'Old Pier';
  const b = state.world.blocks.find(bl => bl.district === 'pier') || state.world.blocks[0];
  state.player.x = b.x - 8; state.player.z = b.z + 6; state.player.y = 0; state.player.yaw = Math.PI * 0.2;
  if (player && player.model) { player.model.position.set(state.player.x, 0, state.player.z); player.model.rotation.y = state.player.yaw; }

  const camPos = new THREE.Vector3(state.player.x + 5, 2.8, state.player.z + 6);
  const lookAt = new THREE.Vector3(state.player.x - 4, 1.8, state.player.z - 8);
  return {
    camera: { position: camPos, lookAt, fov: 55 },
    hudExtra: () => ({ timeLabel: '20:14 Nightfall', prompt: 'Phone: Contacts · Missions · Map · Garage' }),
  };
}
