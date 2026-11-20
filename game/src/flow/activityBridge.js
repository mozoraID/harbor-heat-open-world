// Activity bridge: starts side activities when the player enters their markers.
import * as THREE from 'three';
import { createTaxiFares } from '../missions/sideActivities/taxiFares.js';
import { createStreetRace, RACE_ROUTES } from '../missions/sideActivities/streetRaces.js';
import { createStuntJumps, STUNT_JUMPS } from '../missions/sideActivities/stuntJumps.js';
import { createSprayShop, SPRAY_SHOPS } from '../missions/sideActivities/sprayShop.js';
import { createGarageUpgrades } from '../missions/sideActivities/garageUpgrades.js';

const ACTIVITY_MARKERS = [
  { id: 'taxi', type: 'taxi', x: -60, z: 260, radius: 8, label: 'Taxi', color: '#ffcc4d', prompt: 'Start Taxi Fare' },
  { id: 'race_marina', type: 'race', routeId: 'marina_sprint', x: -145, z: 319, radius: 8, label: 'Race', color: '#ff6b5a', prompt: 'Start Marina Sprint' },
  { id: 'race_dock', type: 'race', routeId: 'dock_dash', x: -261, z: -261, radius: 8, label: 'Race', color: '#ff6b5a', prompt: 'Start Dock Dash' },
  { id: 'stunt_pier', type: 'stunt', jumpId: 'pier_launch', x: -261, z: 290, radius: 8, label: 'Stunt', color: '#5cc8ff', prompt: 'Stunt Jump: Pier Launch' },
  { id: 'stunt_lagoon', type: 'stunt', jumpId: 'lagoon_leap', x: 29, z: 170, radius: 8, label: 'Stunt', color: '#5cc8ff', prompt: 'Stunt Jump: Lagoon Leap' },
  { id: 'spray_beach', type: 'spray', x: SPRAY_SHOPS[0].x, z: SPRAY_SHOPS[0].z, radius: 10, label: 'Spray', color: '#3ee6b0', prompt: 'Respray & Clear Wanted' },
  { id: 'spray_docks', type: 'spray', x: SPRAY_SHOPS[1].x, z: SPRAY_SHOPS[1].z, radius: 10, label: 'Spray', color: '#3ee6b0', prompt: 'Respray & Clear Wanted' },
  { id: 'garage', type: 'garage', x: -203, z: 203, radius: 9, label: 'Garage', color: '#ff7ad1', prompt: 'Open Garage Upgrades' },
];

function dist2(ax,az,bx,bz){const dx=ax-bx,dz=az-bz;return dx*dx+dz*dz;}

export function createActivityBridge(ctx = {}) {
  const { state, scene, input } = ctx;
  const taxi = createTaxiFares();
  const jumps = createStuntJumps();
  const spray = createSprayShop();
  const garage = createGarageUpgrades();
  let active = null; // {type, inst, marker}
  let nearby = null;

  const group = new THREE.Group();
  group.name = 'activityMarkers';
  if (scene) scene.add(group);

  // simple static markers
  for (const m of ACTIVITY_MARKERS) {
    const ringGeo = new THREE.RingGeometry(1.2, 1.8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(m.color), transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(m.x, 0.06, m.z);
    group.add(ring);
  }

  function tryStart(marker, gameState) {
    if (marker.type === 'taxi') { active = { type: 'taxi', inst: taxi, marker }; taxi.start(gameState); }
    else if (marker.type === 'race') { const r = createStreetRace(marker.routeId || 'marina_sprint'); active = { type: 'race', inst: r, marker }; r.start(); }
    else if (marker.type === 'stunt') { active = { type: 'stunt', inst: jumps, marker }; jumps.start(marker.jumpId); }
    else if (marker.type === 'spray') {
      const res = spray.use(gameState, {});
      if (res.ok) {
        gameState.player.money = Math.max(0, (gameState.player.money || 0) - res.cost);
        gameState.player.wanted = 0;
        if (!Array.isArray(gameState.notifications)) gameState.notifications = [];
        gameState.notifications.push({ text: `CAR REPAINTED (-S$ ${res.cost})`, tone: 'mint' });
      } else if (res.reason === 'no_money') {
        gameState.notifications = [...(gameState.notifications||[]), { text: 'NOT ENOUGH CASH', tone: 'coral' }];
      }
      // spray is instant, no persistent active
      return;
    } else if (marker.type === 'garage') {
      if (!Array.isArray(gameState.notifications)) gameState.notifications = [];
      gameState.notifications.push({ text: 'GARAGE: Upgrades available', tone: 'gold' });
      // full UI not required; expose catalog in state for phone/pause consumers
      gameState.garageCatalog = garage.getCatalog('player', gameState.carUpgrades || {});
      return;
    }
  }

  function update(dt, gameState = state) {
    if (!gameState || !gameState.player) return;
    const p = gameState.player;
    // find nearby
    nearby = null;
    if (!active) {
      for (const m of ACTIVITY_MARKERS) {
        if (dist2(p.x, p.z, m.x, m.z) <= m.radius*m.radius) { nearby = m; break; }
      }
      if (nearby && !gameState.interact) {
        gameState.interact = { key: 'F', action: nearby.prompt };
      }
      // start on enter press (input module consumes it in main, but if flow runs we can also watch a flag)
      if (nearby && gameState._flowEnterPressed) {
        tryStart(nearby, gameState);
        gameState._flowEnterPressed = false;
      }
    }

    if (active) {
      const res = active.inst.update(gameState, dt);
      const hudInfo = active.inst.getHud ? active.inst.getHud() : (res && res.hud);
      if (hudInfo) {
        if (hudInfo.objective) gameState.activityObjective = hudInfo.objective;
        if (hudInfo.target && (!gameState.minimap || !gameState.minimap.target)) {
          // don't clobber mission target; store separately
          gameState.activityTarget = hudInfo.target;
        }
      }
      if (res && res.done) {
        const reward = res.result?.reward;
        if (reward) {
          gameState.player.money = (gameState.player.money || 0) + (reward.money || 0);
          if (reward.respect) {
            gameState.progression = gameState.progression || { respectXP: 0 };
            gameState.progression.respectXP += reward.respect;
          }
          gameState.notifications = [...(gameState.notifications||[]), { text: `+S$ ${reward.money||0}`, tone: 'mint' }];
        }
        active = null;
      }
    }
  }

  function setEnterPressed(v) { if (state) state._flowEnterPressed = !!v; }
  function destroy() { if (scene) scene.remove(group); }

  return { update, setEnterPressed, destroy, markers: ACTIVITY_MARKERS, getActive: () => active };
}
