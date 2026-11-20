// Weapon definitions and simple combat state manager.
export function getWeaponDefs() {
  return [
    { slot: 1, id: 'fists', name: 'Fists', ammo: null, owned: true, damage: 8, rate: 2.5 },
    { slot: 2, id: 'bat', name: 'Bat', ammo: null, owned: true, damage: 18, rate: 1.8 },
    { slot: 3, id: 'pistol', name: 'Kestrel 9', ammo: [12, 48], owned: true, damage: 22, rate: 3.5 },
    { slot: 4, id: 'smg', name: 'Viper SMG', ammo: [30, 120], owned: true, damage: 14, rate: 10 },
    { slot: 5, id: 'shotgun', name: 'Breaker Shotgun', ammo: [6, 24], owned: true, damage: 40, rate: 1.2 },
    { slot: 6, id: 'rifle', name: 'Tern AR', ammo: [24, 96], owned: true, damage: 26, rate: 6 },
  ];
}

export function createCombatSystem(state) {
  state.weapons = getWeaponDefs();
  state.player.activeWeapon = 3;
  state.activeWeapon = 3;
  let cooldown = 0;
  function update(dt) { cooldown = Math.max(0, cooldown - dt); }
  return { update };
}
