// Directs deterministic screenshot scenes by staging world state and camera for ?shot=NAME.
import * as THREE from 'three';
import { stageStreetShot } from './streetShot.js';
import { stageChaseShot } from './chaseShot.js';
import { stageMapShot } from './mapShot.js';
import { stagePhoneShot } from './phoneShot.js';
import { stageTitleShot } from './titleShot.js';

export function setupShots(name, ctx) {
  ctx.state.mode = 'shot';
  ctx.state.shot = name;

  const stageMap = {
    street: stageStreetShot,
    chase: stageChaseShot,
    map: stageMapShot,
    phone: stagePhoneShot,
    title: stageTitleShot,
  };
  const fn = stageMap[name] || stageStreetShot;
  const ctrl = fn(ctx) || {};

  let frames = 0;
  let readySet = false;

  return {
    frame(nowSec) {
      const dt = 1 / 60;
      // small deterministic updates for animated elements
      if (ctx.city && ctx.city.water) ctx.city.water.update(dt);
      if (ctrl.update) ctrl.update(dt, frames);

      // keep HUD in sync with staged state
      const hudExtra = ctrl.hudExtra ? ctrl.hudExtra() : { timeLabel: '18:42 Golden Hour' };
      if (ctrl.prompt !== undefined) hudExtra.prompt = ctrl.prompt;
      ctx.state.interact = hudExtra.prompt || null;
      ctx.state.timeOfDay = hudExtra.timeLabel || ctx.state.timeOfDay || '18:42';
      if (ctx.state.car) ctx.state.speed = Math.abs(ctx.state.car.speed || 0);
      ctx.hud.update(ctx.state);

      // camera control
      if (ctrl.camera) {
        const c = ctrl.camera;
        ctx.app.camera.position.copy(c.position);
        if (c.lookAt) ctx.app.camera.lookAt(c.lookAt);
        if (c.fov) {
          ctx.app.camera.fov = c.fov;
          ctx.app.camera.updateProjectionMatrix();
        }
      }

      ctx.app.renderer.render(ctx.app.scene, ctx.app.camera);
      frames++;
      if (!readySet && frames >= 8) {
        readySet = true;
        window.__shotReady = true;
      }
    },
  };
}
