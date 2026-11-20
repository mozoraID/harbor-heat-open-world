// Weapon definitions and combat system: switching, firing, and hit resolution.
export function getWeaponDefs() {
  return [
    { slot: 1, id: 'fists', name: 'Fists', ammo: null, owned: true, damage: 10, rate: 2.5, range: 2.2 },
    { slot: 2, id: 'bat', name: 'Bat', ammo: null, owned: true, damage: 22, rate: 1.8, range: 2.6 },
    { slot: 3, id: 'pistol', name: 'Kestrel 9', ammo: [12, 48], owned: true, damage: 24, rate: 4.0, range: 70 },
    { slot: 4, id: 'smg', name: 'Viper SMG', ammo: [30, 120], owned: true, damage: 14, rate: 10.0, range: 65 },
    { slot: 5, id: 'shotgun', name: 'Breaker Shotgun', ammo: [6, 24], owned: true, damage: 45, rate: 1.2, range: 30 },
    { slot: 6, id: 'rifle', name: 'Tern AR', ammo: [24, 96], owned: true, damage: 28, rate: 7.0, range: 90 },
  ];
}

export function createCombatSystem(state) {
  state.weapons = getWeaponDefs();
  state.player.activeWeapon = state.player.activeWeapon || 3;
  state.activeWeapon = state.player.activeWeapon;
  let cooldown = 0;

  function switchWeapon(slot) {
    const w = state.weapons.find(x => x.slot === slot);
    if (w && w.owned) { state.player.activeWeapon = slot; state.activeWeapon = slot; }
  }

  function getActive() {
    return state.weapons.find(x => x.slot === (state.player.activeWeapon || state.activeWeapon)) || state.weapons[0];
  }

  function tryFire(scene) {
    const w = getActive();
    if (!w || cooldown > 0) return false;
    if (w.ammo && w.ammo[0] <= 0) return false;
    cooldown = 1 / (w.rate || 2);
    if (w.ammo) w.ammo[0] = Math.max(0, w.ammo[0] - 1);
    const inCar = !!state.player.inCar;
    const ox = inCar ? state.car.mesh.position.x : state.player.x;
    const oz = inCar ? state.car.mesh.position.z : state.player.z;
    const oy = inCar ? 1.2 : 1.5;
    const yaw = inCar ? state.car.yaw : state.player.yaw;
    const dx = Math.sin(yaw), dz = Math.cos(yaw);
    if (state.effects) state.effects.spark(ox + dx * 1.2, oy, oz + dz * 1.2);
    if (state.police && state.police.reportCrime) {
      // any public violence/shot risks wanted heat; proximity to cops/peds makes it immediate
      let nearCops = false, nearPeds = false;
      if (state.police.units && state.police.units.cars) {
        nearCops = state.police.units.cars.some(c => c && c.mesh && ((c.mesh.position.x - ox) ** 2 + (c.mesh.position.z - oz) ** 2) < 60 * 60);
      }
      if (state.pedestrians && state.pedestrians.peds) {
        nearPeds = state.pedestrians.peds.some(p => !p.dead && ((p.x - ox) ** 2 + (p.z - oz) ** 2) < 25 * 25);
      }
      state.police.reportCrime(w.slot >= 3 ? 'shoot' : (nearPeds ? 'hitPed' : 'shoot'), state.time);
      if (nearCops) state.police.reportCrime('shoot', state.time);
    }

    let best = null, bestT = w.range;
    const tryHit = (obj, kind, r = 1.2) => {
      const tx = obj.mesh ? obj.mesh.position.x : obj.x;
      const tz = obj.mesh ? obj.mesh.position.z : obj.z;
      const vx = tx - ox, vz = tz - oz;
      const t = vx * dx + vz * dz;
      if (t < 0.3 || t > bestT) return;
      const perp = Math.abs(vx * dz - vz * dx);
      if (perp > r) return;
      best = { obj, kind, t, x: tx, z: tz };
      bestT = t;
    };

    if (state.pedestrians && state.pedestrians.peds) {
      for (const p of state.pedestrians.peds) if (!p.dead && p.down <= 0) tryHit(p, 'ped', 0.9);
    }
    if (state.police && state.police.units) {
      for (const c of state.police.units.cars) if (c && !c.dead) tryHit(c, 'policeCar', 2.0);
    }
    const pools = [state.cars || []];
    if (state.traffic && state.traffic.cars) pools.push(state.traffic.cars);
    const playerCar = state.car;
    for (const list of pools) {
      for (const c of list) {
        if (!c || c === playerCar || c.dead) continue;
        tryHit(c, 'car', c.radius || 1.8);
      }
    }

    if (best) {
      if (state.effects) state.effects.spark(best.x, 1.0, best.z);
      if (best.kind === 'ped') {
        best.obj.health = (best.obj.health || 40) - w.damage;
        best.obj.down = 999;
        if (best.obj.health <= 0) {
          best.obj.dead = true;
          if (best.obj.model) best.obj.model.visible = false;
          if (state.police && state.police.reportCrime) state.police.reportCrime('killPed', state.time);
        } else {
          if (state.police && state.police.reportCrime) state.police.reportCrime('hitPed', state.time);
        }
      } else {
        const car = best.obj;
        car.health = Math.max(0, (car.health == null ? 100 : car.health) - w.damage);
        car.damage = Math.min(1, 1 - car.health / 100);
        if (best.kind === 'policeCar' && state.police && state.police.reportCrime) state.police.reportCrime('ramPolice', state.time);
        if (car.health <= 0 && !car.dead) {
          car.dead = true; car.speed = 0; car.exploded = true;
          if (car.mesh) { car.mesh.rotation.z = 0.25; car.mesh.position.y = -0.1; }
          if (state.effects) state.effects.explode(best.x, 1.2, best.z);
          if (state.police && state.police.reportCrime) state.police.reportCrime(best.kind === 'policeCar' ? 'killPolice' : 'explosion', state.time);
        }
      }
    }
    return true;
  }

  function update(dt, state, scene, input) {
    cooldown = Math.max(0, cooldown - dt);
    if (!state || state.mode !== 'play' || state.player.dead || state.player.busted || (state.respawn && state.respawn.state)) return;
    if (input) {
      const slot = input.consumeWeaponSlot ? input.consumeWeaponSlot() : 0;
      if (slot) switchWeapon(slot);
      const pressed = input.consumeFire ? input.consumeFire() : false;
      const firing = input.state && input.state.firing;
      if (pressed || (firing && getActive().rate >= 4)) tryFire(scene);
    }
  }

  return { update, tryFire, switchWeapon, getActive };
}
