// Stages the phone screenshot: hero on boardwalk by beach with real phone open to Sasha Lune messages.
import * as THREE from 'three';
import { createPhone } from '../ui/menus/phone.js';

export function stagePhoneShot({ app, state, hud, player }) {
  if (player && player.model) {
    player.model.visible = true;
  }
  state.player.inCar = null;
  state.car = null;
  state.player.health = 100;
  state.player.armour = 0;
  state.player.wanted = 0;
  state.player.money = 3120;
  state.player.activeWeapon = 1;

  // Boardwalk by Marigold Beach (south side) facing north toward pier/ferris wheel background
  const layout = state.world.layout;
  const beachZ = layout.offsetZ + layout.n * layout.cell + layout.roadWidth / 2 - 10;
  state.player.x = -40;
  state.player.z = beachZ - 6;
  state.player.y = 0;
  state.player.yaw = Math.PI; // facing north (toward pier/city) so pier/wheel area is behind hero in view
  state.districtName = 'Marigold Beach';
  if (player && player.model) {
    player.model.position.set(state.player.x, 0, state.player.z);
    player.model.rotation.y = state.player.yaw;
  }

  const phone = createPhone(document.body, {});
  const messages = [
    { from: 'Mama Inés', text: 'Mijo, check in when you can. The diner is safe for now.' },
    { from: 'Sasha Lune', text: "Car's at the marina. Don't scratch it." },
    { me: true, text: 'Copy. Heading there now.' },
    { from: 'Sasha Lune', text: "Kade is moving product tonight at Ferro Docks. You in?" },
    { me: true, text: "I'm in. Keep the engine warm." },
    { from: 'Sasha Lune', text: "Good. Pier 9, 20 minutes. Bring heat—SHP's sniffing around." },
  ];
  phone.show({
    timeOfDay: '20:14',
    phoneDate: 'FRI · NOV 20',
    districtName: 'Marigold Beach',
    messages,
    radio: { station: 'WAVE 101.7', genre: 'Coastline Pop', track: 'Sunset Run' },
    phoneNotification: { from: 'Sasha Lune', text: "Kade is moving product tonight at Ferro Docks. You in?" },
  });
  // open Messages thread; clear the right-hand HUD so the phone does not overlap it
  const msgApp = phone.el.querySelector('[data-app="messages"]');
  if (msgApp) msgApp.click();
  hud.setPhoneOpen(true);

  // warm evening ambience
  if (app.scene.fog) { app.scene.fog.color.setHex(0x7a5a6a); app.scene.fog.near = 40; app.scene.fog.far = 420; }
  app.renderer.toneMappingExposure = 0.95;

  // camera looking at hero on boardwalk with pier/ferris wheel area behind (north, lower z)
  const camPos = new THREE.Vector3(state.player.x + 4.5, 2.4, state.player.z + 5.5);
  const lookAt = new THREE.Vector3(state.player.x - 1.5, 1.5, state.player.z - 10);

  let t = 0;
  return {
    camera: { position: camPos, lookAt, fov: 55 },
    hudExtra: () => ({ timeLabel: '20:14 Evening', prompt: null }),
    update(dt, frames) {
      t += dt;
      if (state.traffic) state.traffic.update(dt, state);
      if (state.pedestrians) state.pedestrians.update(dt, state);
      // subtle idle sway
      if (player && player.model) {
        player.model.position.set(state.player.x, 0, state.player.z);
        player.model.rotation.y = state.player.yaw + Math.sin(t * 0.4) * 0.03;
      }
    },
  };
}
