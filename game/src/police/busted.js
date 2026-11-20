// Handles busted state when player is stopped near police on foot.
export function checkBusted(state) {
  if (!state.police || !state.police.units) return false;
  const onFoot = state.police.units.foot || [];
  if (state.player.inCar) return false;
  for (const o of onFoot) {
    const dx = o.x - state.player.x, dz = o.z - state.player.z;
    if (dx * dx + dz * dz < 9) return true;
  }
  return false;
}
