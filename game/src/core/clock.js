// Frame timing helper with fixed-step accumulator for stable simulation.
export function createClock() {
  let last = 0;
  let acc = 0;
  const step = 1 / 60;
  const maxFrame = 0.25;
  return {
    step,
    tick(nowSec) {
      if (!last) last = nowSec;
      const dt = Math.min(nowSec - last, maxFrame);
      last = nowSec;
      acc += dt;
      let steps = 0;
      while (acc >= step && steps < 5) {
        acc -= step;
        steps++;
      }
      return { dt, steps, step, alpha: acc / step };
    },
    reset(nowSec) {
      last = nowSec;
      acc = 0;
    },
  };
}
