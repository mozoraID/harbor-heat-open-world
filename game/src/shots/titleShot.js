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
    { slot: 1, data: { missionPercent: 38, money: 18450, playTime: 4 * 3600 + 12 * 60, savedAt: '2026-11-18T20:14:00.000Z', rank: 'Wheelman', activeMissionId: 'act2_glasswater_job', completedMissions: ['act1_first_light', 'act1_tide_breaker', 'act1_neon_tides'] } },
    { slot: 2, data: { missionPercent: 21, money: 6300, playTime: 2 * 3600 + 5 * 60, savedAt: '2026-11-19T22:05:00.000Z', rank: 'Runner', activeMissionId: 'act1_neon_tides', completedMissions: ['act1_first_light', 'act1_tide_breaker'] } },
    { slot: 3, data: { missionPercent: 9, money: 1240, playTime: 48 * 60, savedAt: '2026-11-20T18:30:00.000Z', rank: 'Street Rat', activeMissionId: 'act1_tide_breaker', completedMissions: ['act1_first_light'] } },
  ]);

  const title = createTitleScreen(document.body, { getSlots: filledSlots });
  title.show();
  // open Load Game to show the 3 filled slot cards
  const loadBtn = title.el.querySelector('[data-action="load"]');
  if (loadBtn) loadBtn.click();

  const checklist = createFeatureChecklist(document.body);
  checklist.show();
  checklist.setCompactTitleMode(true);
  if (new URLSearchParams(location.search).get('debugNoUI') === '1') document.querySelectorAll('.hh-title-screen,.hh-checklist').forEach(e => e.style.display = 'none');

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
