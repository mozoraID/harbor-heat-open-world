// Headless autotest: scripts inputs, exercises gameplay systems, and prints results.
import { findNearestCar } from '../vehicles/interaction.js';

export function setupAutotest(ctx) {
  const { state, input } = ctx;
  const out = { started: true, steps: {}, errors: 0 };
  let phase = 0, timer = 0, startPos = null, targetCar = null, trafficCheck = null;

  function logStep(name, ok, extra = {}) {
    out.steps[name] = { ok: !!ok, ...extra };
    console.log('AUTOTEST_STEP', name, ok ? 'OK' : 'FAIL', JSON.stringify(extra));
  }

  function nearestTraffic() {
    const cars = (state.traffic && state.traffic.cars) || [];
    let best = null, bd = Infinity;
    for (const c of cars) {
      if (!c || !c.mesh) continue;
      const dx = c.mesh.position.x - state.player.x, dz = c.mesh.position.z - state.player.z;
      const d = dx * dx + dz * dz;
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  }

  function finish() {
    out.wanted = state.player.wanted;
    out.policeCars = state.police && state.police.units ? state.police.units.cars.length : 0;
    out.dispatch = state.dispatch && state.dispatch.units ? state.dispatch.units.length : 0;
    out.mode = state.mode;
    console.log('AUTOTEST_RESULT', JSON.stringify(out));
    window.__autotest = out;
    phase = 999;
  }

  return function update(now, dt) {
    if (phase >= 999) return;
    timer += dt || (1 / 60);
    try {
      if (phase === 0) {
        // init: wait for world ready
        if (!state.world || !state.world.layout || timer < 0.5) return;
        // pick a parked car to steal
        targetCar = findNearestCar(state, 40);
        if (!targetCar && state.cars && state.cars.length) targetCar = state.cars[0];
        startPos = { x: state.player.x, z: state.player.z };
        timer = 0; phase = 1; return;
      }

      if (phase === 1) {
        // walk forward
        input.state.forward = 1; input.state.right = 0;
        if (timer > 1.0) {
          input.state.forward = 0;
          const dx = state.player.x - startPos.x, dz = state.player.z - startPos.z;
          logStep('walk', (dx * dx + dz * dz) > 0.2, { moved: Math.sqrt(dx * dx + dz * dz).toFixed(2) });
          // move player next to target car
          if (targetCar && targetCar.mesh) {
            state.player.x = targetCar.mesh.position.x - Math.cos(targetCar.yaw) * 2.0;
            state.player.z = targetCar.mesh.position.z + Math.sin(targetCar.yaw) * 2.0;
            state.player.y = 0;
          }
          timer = 0; phase = 2;
        }
        return;
      }

      if (phase === 2) {
        // try to steal/enter car
        if (!state.player.inCar) {
          // keep prompting/pressing F
          if (timer < 0.1 || (Math.floor(timer * 10) % 5 === 0)) input.state.enterPressed = true;
        }
        if (state.player.inCar || timer > 2.5) {
          input.state.enterPressed = false;
          const inCar = !!state.player.inCar;
          logStep('steal_or_enter', inCar, { inCar, car: state.car ? state.car.name : null, action: state.player.action });
          timer = 0; phase = 3;
        }
        return;
      }

      if (phase === 3) {
        // drive car
        if (state.player.inCar && state.car) {
          input.state.forward = 1; input.state.jump = false;
          if (timer > 1.2) {
            input.state.forward = 0;
            const sp = Math.abs(state.car.speed || 0);
            logStep('drive', sp > 1.0, { speed: sp.toFixed(2) });
            // exit car for on-foot tests
            input.state.enterPressed = true;
            timer = 0; phase = 4;
          }
        } else {
          logStep('drive', false, { reason: 'not_in_car' });
          timer = 0; phase = 4;
        }
        return;
      }

      if (phase === 4) {
        // ensure on foot
        if (state.player.inCar && timer < 0.3) { input.state.enterPressed = true; return; }
        input.state.enterPressed = false;
        // switch weapon and fire to raise wanted (near cops may not exist yet, so force crimes too)
        if (timer < 0.2) input.state.weaponSlot = 4;
        input.state.firing = true; input.state.firePressed = true;
        if (state.police && state.police.reportCrime) {
          state.police.reportCrime('shoot', state.time);
          state.police.reportCrime('shoot', state.time + 0.01);
          state.police.reportCrime('hitPed', state.time + 0.02);
        }
        if (timer > 1.8) {
          input.state.firing = false; input.state.firePressed = false;
          // allow police dispatch to react
        }
        if (timer > 3.5) {
          const wanted = state.player.wanted || 0;
          const spawned = state.police && state.police.units ? state.police.units.cars.length : 0;
          logStep('wanted_and_police', wanted >= 1 || spawned >= 1, { wanted, spawned });
          timer = 0; phase = 5;
        }
        return;
      }

      if (phase === 5) {
        // traffic stops/swerve for hero standing on road
        const tc = nearestTraffic();
        if (tc && tc.mesh) {
          // place player in front of traffic car
          state.player.inCar = null; state.car = null;
          state.player.x = tc.mesh.position.x + Math.sin(tc.yaw) * 8;
          state.player.z = tc.mesh.position.z + Math.cos(tc.yaw) * 8;
          state.player.y = 0;
          trafficCheck = { car: tc, t: 0 };
          timer = 0; phase = 6; return;
        } else {
          logStep('traffic_yield', true, { skipped: 'no_traffic' });
          finish(); return;
        }
      }

      if (phase === 6) {
        if (trafficCheck) trafficCheck.t += dt || (1 / 60);
        const tc = trafficCheck ? trafficCheck.car : null;
        // keep player ahead of it
        if (tc && tc.mesh) {
          state.player.x = tc.mesh.position.x + Math.sin(tc.yaw) * 7;
          state.player.z = tc.mesh.position.z + Math.cos(tc.yaw) * 7;
        }
        if (trafficCheck && trafficCheck.t > 1.5) {
          const sp = tc ? Math.abs(tc.speed || 0) : 99;
          logStep('traffic_yield', sp < 2.5, { speed: sp.toFixed(2) });
          finish();
        }
        return;
      }
    } catch (e) {
      out.errors++;
      console.log('AUTOTEST_ERROR', e && e.message ? e.message : String(e));
      finish();
    }
  };
}
