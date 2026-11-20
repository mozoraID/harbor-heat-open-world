// Taxi fares side activity: pick up and drop off passengers for cash.
export function createTaxiFares() {
  let active = null;
  let cooldown = 0;

  function start(gameState = {}) {
    const px = gameState.player?.x || 0, pz = gameState.player?.z || 0;
    const pickup = { x: px + 80, z: pz + 40, radius: 10 };
    const drop = { x: px - 120, z: pz + 120, radius: 12 };
    active = { id: 'taxi_' + Date.now(), phase: 'pickup', pickup, drop, fare: 350, tip: 150, timer: 90, label: 'Taxi Fare' };
    return active;
  }

  function update(gameState = {}, dt = 0) {
    if (!active) return null;
    active.timer = Math.max(0, active.timer - dt);
    const p = gameState.player || {};
    const d2 = (a,b)=>{const dx=a.x-b.x,dz=a.z-b.z;return dx*dx+dz*dz;};
    if (active.phase === 'pickup' && p.inCar && d2(p, active.pickup) < active.pickup.radius**2) {
      active.phase = 'dropoff';
    } else if (active.phase === 'dropoff' && d2(p, active.drop) < active.drop.radius**2) {
      return finish(gameState, true);
    }
    if (active.timer <= 0) return finish(gameState, false);
    return getHud(active);
  }

  function finish(gameState, success) {
    if (!active) return null;
    const res = { ...active, success, reward: success ? active.fare + (active.timer > 30 ? active.tip : 0) : 0 };
    active = null; cooldown = 10;
    return { done: true, result: res, hud: null };
  }

  function getHud(a = active) {
    if (!a) return null;
    const obj = a.phase === 'pickup' ? 'Pick up the passenger' : 'Drop off the passenger';
    return { objective: obj, next: a.phase === 'pickup' ? 'Drive to destination' : 'Collect fare', timer: a.timer, target: a.phase === 'pickup' ? a.pickup : a.drop, label: a.label };
  }

  function isActive() { return !!active; }
  function getState() { return active ? { ...active } : null; }

  return { start, update, finish, getHud, isActive, getState };
}
