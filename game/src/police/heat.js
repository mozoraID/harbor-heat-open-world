// Tracks wanted heat level, crimes, decay, and search/flashing-star state.
export function createHeat() {
  const heat = { value: 0, stars: 0, search: 0, lastCrime: 0, visible: 0 };

  function add(amount, now) {
    heat.value = Math.min(500, heat.value + amount);
    heat.lastCrime = now;
    heat.search = 0;
  }

  function update(dt, now, canSeePolice) {
    if (canSeePolice) { heat.visible = 1.0; heat.search = 0; heat.lastCrime = now; }
    else heat.visible = Math.max(0, heat.visible - dt * 0.1);
    const decay = canSeePolice ? 0 : (heat.search > 0.5 ? 14 : 2.5);
    heat.value = Math.max(0, heat.value - dt * decay);
    if (!canSeePolice && heat.stars > 0 && now - heat.lastCrime > 3) {
      heat.search = Math.min(12, heat.search + dt);
    } else if (canSeePolice) {
      heat.search = 0;
    }
    const thresholds = [0, 30, 80, 150, 260, 380];
    let s = 0;
    for (let i = 0; i < thresholds.length; i++) if (heat.value >= thresholds[i]) s = i;
    heat.stars = s;
    return heat;
  }

  function reportCrime(type, now) {
    const amounts = { steal: 35, hitPed: 20, killPed: 50, ramPolice: 25, shoot: 18, killPolice: 80, explosion: 40 };
    add(amounts[type] || 15, now);
  }

  return { heat, update, reportCrime };
}
