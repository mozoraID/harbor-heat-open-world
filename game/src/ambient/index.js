import { createDayNight } from './dayNight.js';
import { createStreetLights } from './streetLights.js';
import { createNeonSigns } from './neonSigns.js';
import { createBirdsAndClouds } from './birdsAndClouds.js';
import { createWaterSparkle } from './waterSparkle.js';

export function addAmbient(ctx) {
  const { scene, state } = ctx || {};
  const sky = ctx.sky || (ctx.city && ctx.city.sky);
  const buildings = ctx.buildings || (ctx.city && ctx.city.buildings);
  const props = ctx.props || (ctx.city && ctx.city.props);
  const layout = ctx.layout || (ctx.city && ctx.city.layout) || (state && state.world && state.world.layout);

  const ectx = { scene, state, sky, buildings, props, layout, city: ctx.city || ctx };

  const dayNight = createDayNight(ectx);
  const streetLights = createStreetLights(ectx);
  const neonSigns = createNeonSigns(ectx);
  const birdsAndClouds = createBirdsAndClouds(ectx);
  const waterSparkle = createWaterSparkle(ectx);

  // sync initial time into state
  if (state && state.timeOfDayHours == null) state.timeOfDayHours = dayNight.hour;

  function update(dt, st) {
    const s = st || state;
    // detect if a shot/system has pinned time explicitly: state.ambientTimeFrozen or shot mode handled by caller bypass.
    // dayNight respects its own frozen flag (set via setTime(...,{freeze:true}))
    if (dayNight) dayNight.update(dt, s);
    if (streetLights) streetLights.update(dt, s);
    if (neonSigns) neonSigns.update(dt, s);
    if (birdsAndClouds) birdsAndClouds.update(dt, s);
    if (waterSparkle) waterSparkle.update(dt, s);
  }

  function setTime(hours, opts) {
    if (dayNight && dayNight.setTime) dayNight.setTime(hours, opts);
  }

  return { update, setTime, dayNight };
}
