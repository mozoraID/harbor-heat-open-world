// HUD root: composes all widgets and exposes the HUD system API.
import { injectHudStyles } from './hudStyles.js';
import { el } from './utils.js';
import { createMissionPanel } from './missionPanel.js';
import { createDispatchPanel } from './dispatchPanel.js';
import { createMoneyClock } from './moneyClock.js';
import { createWeaponBar } from './weaponBar.js';
import { createRankBar } from './rankBar.js';
import { createVitals } from './vitals.js';
import { createMinimap } from './minimap.js';
import { createSpeedometer } from './speedometer.js';
import { createRadioToast } from './radioToast.js';
import { createDialogueBox } from './dialogueBox.js';
import { createNotifications } from './notifications.js';
import { createDistrictBanner } from './districtBanner.js';
import { createCrosshair } from './crosshair.js';
import { createInteractPrompt } from './interactPrompt.js';

export function createHudSystem(rootEl) {
  injectHudStyles();
  const root = el('div', 'hh-hud');
  rootEl.appendChild(root);

  const topLeft = el('div', 'hh-top-left');
  const topRight = el('div', 'hh-top-right hh-panel hh-accent-mint');
  topRight.style.padding = '8px 12px';
  topRight.style.minWidth = '240px';
  const bottomLeft = el('div', 'hh-bottom-left');
  const bottomRight = el('div', 'hh-bottom-right');
  const bottomCenter = el('div', 'hh-bottom-center');
  const centerTop = el('div', 'hh-center-top');

  root.append(topLeft, topRight, bottomLeft, bottomRight, bottomCenter, centerTop);

  const mission = createMissionPanel(topLeft);
  const dispatch = createDispatchPanel(topLeft);
  const moneyClock = createMoneyClock(topRight);
  const notifications = createNotifications(root);

  const minimap = createMinimap(bottomLeft);
  const vitals = createVitals(bottomLeft);

  const speedo = createSpeedometer(bottomRight);
  const rank = createRankBar(root);
  const radio = createRadioToast(root);
  const weapon = createWeaponBar(root);
  const dialogue = createDialogueBox(bottomCenter);
  const banner = createDistrictBanner(centerTop);
  const crosshair = createCrosshair(root);
  const interact = createInteractPrompt(root);

  const widgets = [mission, dispatch, moneyClock, notifications, minimap, vitals, speedo, rank, radio, weapon, dialogue, banner, crosshair, interact];

  function update(state) {
    if (!state) return;
    for (const w of widgets) {
      try { w.update(state); } catch (e) { /* keep HUD resilient */ }
    }
  }

  function setMapData(data) { minimap.setMapData(data); }
  function show() { root.style.display = 'block'; }
  function hide() { root.style.display = 'none'; }

  return { update, setMapData, show, hide, el: root };
}
