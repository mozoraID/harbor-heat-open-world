// Stages the map screenshot: an overhead view of Port Solenne with mission context.
import * as THREE from 'three';

export function stageMapShot({ state, app, player }) {
  state.player.inCar = null;
  state.car = null;
  if (player && player.model) player.model.visible = false;
  state.hud.mission = 'Port Solenne Intel';
  state.hud.objective = 'Story missions: 3/8 complete · Side jobs available in Ferro Docks and Cinder Hills.';
  state.player.money = 6420;
  state.districtName = 'Glasswater Heights';
  state.player.x = 0; state.player.z = 0; state.player.y = 0;

  const center = new THREE.Vector3(0, 0, 0);
  const camPos = new THREE.Vector3(0, 260, 120);
  return {
    camera: { position: camPos, lookAt: center, fov: 55 },
    hudExtra: () => ({ timeLabel: '18:55 Golden Hour', prompt: 'Pause Map · Missions · Stats · Settings' }),
  };
}
