// Street races side activity: checkpoint routes with 3 rivals.
export const RACE_ROUTES = {
  marina_sprint: {
    id: 'marina_sprint',
    name: 'Marina Sprint',
    district: 'Marigold Beach',
    checkpoints: [
      { x: -145, z: 261, radius: 12 },
      { x: -29, z: 203, radius: 12 },
      { x: 87, z: 261, radius: 12 },
      { x: 145, z: 319, radius: 12 },
      { x: -29, z: 319, radius: 12 },
    ],
    rivals: [ { name: 'Lina "Slip" Mora', car: 'Bayline Cruiser' }, { name: 'Dex Harrow', car: 'Solenne Vortex GT' }, { name: 'Niko Vale', car: 'Pier Runner' } ],
    reward: { money: 2000, respect: 300 },
  },
  dock_dash: {
    id: 'dock_dash',
    name: 'Dock Dash',
    district: 'Ferro Docks',
    checkpoints: [
      { x: -261, z: -203, radius: 12 },
      { x: -145, z: -261, radius: 12 },
      { x: -203, z: -145, radius: 12 },
      { x: -319, z: -145, radius: 12 },
      { x: -261, z: -261, radius: 12 },
    ],
    rivals: [ { name: 'Mara Pike', car: 'Dock Hauler' }, { name: 'Joss Renn', car: 'Bayline Cruiser' }, { name: 'Tavo Lin', car: 'Cinder Coupe' } ],
    reward: { money: 2500, respect: 380 },
  },
};

export function createStreetRace(routeId = 'marina_sprint') {
  const route = RACE_ROUTES[routeId] || RACE_ROUTES.marina_sprint;
  let state = null;

  function start() {
    state = { routeId: route.id, name: route.name, rivals: route.rivals.map(r => ({ ...r, progress: 0 })), checkpoint: 0, total: route.checkpoints.length, finished: false, position: 4, timer: 0 };
    return state;
  }

  function update(gameState = {}, dt = 0) {
    if (!state || state.finished) return state;
    state.timer += dt;
    const p = gameState.player || {};
    const cp = route.checkpoints[state.checkpoint];
    const dx = (p.x||0)-cp.x, dz=(p.z||0)-cp.z;
    if (dx*dx+dz*dz <= cp.radius*cp.radius) {
      state.checkpoint += 1;
      if (state.checkpoint >= state.total) return finish(gameState);
    }
    // simple rival simulation
    state.rivals.forEach((r,i)=>{ r.progress += dt * (0.22 + i*0.01); });
    const rivalAhead = state.rivals.filter(r => r.progress > (state.checkpoint / state.total)).length;
    state.position = 1 + rivalAhead;
    return getHud();
  }

  function finish(gameState) {
    state.finished = true;
    const pos = state.position || 1;
    const mult = pos === 1 ? 1 : pos === 2 ? 0.6 : pos === 3 ? 0.3 : 0;
    const reward = { money: Math.floor(route.reward.money * mult), respect: Math.floor(route.reward.respect * mult) };
    return { done: true, result: { routeId: route.id, position: pos, reward, time: state.timer }, hud: { objective: pos === 1 ? 'Race won!' : `Finished ${pos}th`, next: 'Collect reward' } };
  }

  function getHud() {
    if (!state) return null;
    const cp = route.checkpoints[Math.min(state.checkpoint, route.checkpoints.length-1)];
    return { objective: `Hit checkpoint ${Math.min(state.checkpoint+1,state.total)}/${state.total}`, next: state.checkpoint+1>=state.total ? 'Finish line' : 'Next checkpoint', target: cp, position: state.position, label: route.name };
  }

  function isActive() { return !!state && !state.finished; }
  function getState() { return state ? { ...state } : null; }
  return { start, update, finish, getHud, isActive, getState, route };
}
