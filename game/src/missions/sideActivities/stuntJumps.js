// Stunt jumps side activity: hit ramps/jumps and land for cash/respect.
export const STUNT_JUMPS = [
  { id: 'pier_launch', name: 'Pier Launch', x: -261, z: 290, radius: 8, landing: { x: -261, z: 330, radius: 14 }, reward: { money: 400, respect: 80 } },
  { id: 'lagoon_leap', name: 'Lagoon Leap', x: 29, z: 170, radius: 8, landing: { x: 29, z: 210, radius: 16 }, reward: { money: 600, respect: 120 } },
  { id: 'cinder_ridge', name: 'Cinder Ridge Drop', x: 261, z: -203, radius: 8, landing: { x: 261, z: -160, radius: 14 }, reward: { money: 500, respect: 100 } },
];

export function createStuntJumps() {
  let completed = new Set();
  let active = null;

  function start(jumpId) {
    const j = STUNT_JUMPS.find(s => s.id === jumpId) || STUNT_JUMPS[0];
    active = { ...j, phase: 'approach' };
    return active;
  }

  function update(gameState = {}, dt = 0) {
    if (!active) return null;
    const p = gameState.player || {};
    const d2=(a,b)=>{const dx=(p.x||0)-a.x,dz=(p.z||0)-a.z;return dx*dx+dz*dz;};
    if (active.phase === 'approach' && p.inCar && d2(active, active.radius) < 1) {
      active.phase = 'airborne';
    }
    if (active.phase === 'airborne') {
      const speed = Math.abs(gameState.car?.speed || 0);
      if (d2(active.landing, active.landing.radius) < 1 && (p.onGround !== false || speed < 5)) {
        return finish(true);
      }
    }
    return getHud();
  }

  function finish(success) {
    if (!active) return null;
    const res = { id: active.id, name: active.name, success, reward: success ? active.reward : { money: 0, respect: 0 } };
    if (success) completed.add(active.id);
    active = null;
    return { done: true, result: res };
  }

  function getHud() {
    if (!active) return null;
    return { objective: active.phase === 'approach' ? `Hit the ${active.name} ramp` : `Land the ${active.name}`, target: active.phase === 'approach' ? active : active.landing, next: active.phase === 'approach' ? 'Launch' : 'Stick the landing' };
  }

  function isCompleted(id) { return completed.has(id); }
  function getCompleted() { return Array.from(completed); }
  function setCompleted(ids=[]) { completed = new Set(ids); }
  function isActive() { return !!active; }
  return { start, update, finish, getHud, isActive, isCompleted, getCompleted, setCompleted, STUNT_JUMPS };
}
