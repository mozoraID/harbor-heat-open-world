// Stages the title screenshot: real title screen over live city with slow camera at sunset.
import * as THREE from 'three';
import { createTitleScreen } from '../ui/menus/titleScreen.js';
import { createFeatureChecklist } from '../flow/featureChecklist.js';
import { createTitleCamera } from '../flow/titleCamera.js';

export function stageTitleShot({ app, state, hud, player }) {
  hud.hide();
  if (player && player.model) player.model.visible = false;
  state.mode = 'title';
  state.districtName = 'Marigold Beach';

  const filledSlots = () => ([
    { slot: 1, data: { missionPercent: 38, money: 18450, playTime: 4 * 3600 + 12 * 60, savedAt: '2026-11-18T20:14:00.000Z', rank: 'Wheelman', completedMissions: [] } },
    { slot: 2, data: { missionPercent: 62, money: 42100, playTime: 7 * 3600 + 48 * 60, savedAt: '2026-11-19T22:05:00.000Z', rank: 'Fixer', completedMissions: [] } },
    { slot: 3, data: { missionPercent: 15, money: 6200, playTime: 1 * 3600 + 35 * 60, savedAt: '2026-11-20T18:30:00.000Z', rank: 'Runner', completedMissions: [] } },
  ]);

  const title = createTitleScreen(document.body, { getSlots: filledSlots });
  title.show();
  // open Load Game to show the 3 filled slot cards
  const loadBtn = title.el.querySelector('[data-action="load"]');
  if (loadBtn) loadBtn.click();

  const checklist = createFeatureChecklist(document.body);
  checklist.show();
  checklist.setCompactTitleMode(true);

  const titleCam = createTitleCamera(app, state);
  titleCam.activate();
  // warm sunset tone
  if (app.scene.fog) { app.scene.fog.color.setHex(0xf2b07a); app.scene.fog.near = 160; app.scene.fog.far = 620; }
  app.renderer.toneMappingExposure = 1.1;

  let ready = 0;
  return {
    hideHud: true,
    update(dt, frames) {
      titleCam.update(dt);
      ready++;
    },
  };
}
