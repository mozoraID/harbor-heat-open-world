// Stages the map/missions screenshots: real pause menu open over the city.
import * as THREE from 'three';
import { createPauseMenu } from '../ui/menus/pauseMenu.js';
import { buildMapData } from '../world/mapData.js';

export function stageMapShot({ app, state, hud, player }, tab = 'map') {
  hud.hide();
  if (player && player.model) player.model.visible = false;
  state.player.inCar = null;
  state.car = null;

  // overhead view over city for blurred backdrop
  state.player.x = 80; state.player.z = -40; state.player.y = 0; state.player.yaw = Math.PI * 0.75;
  state.districtName = 'Glasswater Heights';

  const mapData = buildMapData(state.world.layout);
  const pause = createPauseMenu(document.body, {});
  pause.setMapData(mapData);

  const districts = [
    { name: 'Marigold Beach', x: -87, z: 290 },
    { name: 'Old Pier', x: -261, z: 261 },
    { name: 'Ferro Docks', x: -261, z: -261 },
    { name: 'Cinder Hills', x: 261, z: -261 },
    { name: 'Lagoon Bridge', x: 0, z: 0 },
    { name: 'Glasswater Heights', x: 261, z: 261 },
  ];

  const mapMarkers = {
    missions: [
      { x: 145, z: 29, num: 1 },
      { x: -261, z: -203, num: 2 },
      { x: 203, z: -145, num: 3 },
      { x: -29, z: 319, num: 4 },
      { x: 29, z: 145, num: 5 },
    ],
    safehouses: [
      { x: -87, z: 261, name: 'Marigold Safehouse' },
      { x: -319, z: -261, name: 'Ferro Lockup' },
      { x: 145, z: 203, name: 'Glasswater Flat' },
    ],
    shops: [
      { x: -203, z: 203, letter: 'W', label: 'Wrench' },
      { x: -145, z: 319, letter: 'S', label: 'Spray' },
      { x: 87, z: -145, letter: 'G', label: 'Garage' },
      { x: 261, z: 87, letter: 'A', label: 'Ammo' },
    ],
  };

  const missionGroups = [
    { act: 'Act I — Marigold Beach / Old Pier', missions: [
      { name: 'First Light', status: 'done' },
      { name: 'Tide Breaker', status: 'done' },
      { name: 'Neon Tides', status: 'done' },
    ]},
    { act: 'Act II — Glasswater / Ferro Docks', missions: [
      { name: 'Glasswater Job', status: 'active' },
      { name: 'The Ferro Switch', status: 'locked' },
      { name: 'Lagoon Run', status: 'locked' },
    ]},
    { act: 'Act III — Cinder Hills / Pier 9', missions: [
      { name: "Kade's Ledger", status: 'locked' },
      { name: 'Breakwater', status: 'locked' },
      { name: 'Last Call at Pier 9', status: 'locked' },
    ]},
    { act: 'Side Activities', missions: [
      { name: 'Taxi Fares', status: 'active' },
      { name: 'Street Races', status: 'active' },
      { name: 'Stunt Jumps', status: 'active' },
      { name: 'Spray Shops', status: 'active' },
      { name: 'Garage Upgrades', status: 'active' },
    ]},
  ];

  const data = {
    mapData,
    districts,
    mapMarkers,
    missionGroups,
    player: state.player,
    minimap: { target: { x: 145, z: 29 } },
    currentObjective: 'Take out the SHP blockade at the Glasswater exchange and reach the getaway car.',
    mission: { objective: 'Take out the SHP blockade at the Glasswater exchange and reach the getaway car.' },
    rank: { name: 'Wheelman', xp: 1820, next: 3500 },
    completedMissions: ['act1_first_light', 'act1_tide_breaker', 'act1_neon_tides'],
    playTime: 4 * 3600 + 12 * 60,
    ownedCars: [{ name: 'Solenne Vortex GT' }, { name: 'Bayline Cruiser' }, { name: 'Pier Runner' }],
  };

  pause.show(data);
  if (tab === 'missions') {
    const tabBtn = pause.el.querySelector('[data-tab="missions"]');
    if (tabBtn) tabBtn.click();
  }

  app.canvas.style.filter = 'blur(4px) brightness(0.65) saturate(0.9)';
  const center = new THREE.Vector3(0, 0, 0);
  const camPos = new THREE.Vector3(0, 260, 120);

  return {
    hideHud: true,
    camera: { position: camPos, lookAt: center, fov: 55 },
  };
}
