import { addPierFerrisWheel } from './pierFerrisWheel.js';
import { addLighthouse } from './lighthouse.js';
import { addMarina } from './marina.js';
import { addDocksCranes } from './docksCranes.js';
import { addLagoonBridge } from './lagoonBridge.js';
import { addBillboards } from './billboards.js';
import { addBeachLife } from './beachLife.js';
import { addHillVillas } from './hillVillas.js';

export function addLandmarks(scene, layout, rng) {
  const updaters = [];
  const modules = [
    addPierFerrisWheel,
    addLighthouse,
    addMarina,
    addDocksCranes,
    addLagoonBridge,
    addBillboards,
    addBeachLife,
    addHillVillas,
  ];
  for (const fn of modules) {
    const res = fn(scene, layout, rng);
    if (res && typeof res.update === 'function') updaters.push(res.update);
  }
  return {
    update(dt) {
      for (const u of updaters) u(dt);
    },
  };
}
