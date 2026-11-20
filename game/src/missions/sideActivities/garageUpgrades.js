// Garage upgrades side activity: engine, brakes, armour for owned cars.
export const UPGRADE_DEFS = {
  engine: [
    { level: 1, name: 'Street Tune', cost: 1500, accelMult: 1.08, speedMult: 1.05 },
    { level: 2, name: 'Port Injection', cost: 3200, accelMult: 1.16, speedMult: 1.10 },
    { level: 3, name: 'Kade-Spec Turbo', cost: 6000, accelMult: 1.28, speedMult: 1.18 },
  ],
  brakes: [
    { level: 1, name: 'Ceramic Pads', cost: 1200, brakeMult: 1.12 },
    { level: 2, name: 'Vented Discs', cost: 2600, brakeMult: 1.25 },
    { level: 3, name: 'Race Calipers', cost: 4800, brakeMult: 1.40 },
  ],
  armour: [
    { level: 1, name: 'Reinforced Panels', cost: 1800, armourBonus: 20 },
    { level: 2, name: 'Roll Cage', cost: 3800, armourBonus: 40 },
    { level: 3, name: 'Harbour Plating', cost: 7000, armourBonus: 70 },
  ],
};

export function createGarageUpgrades() {
  // carUpgrades: { [carId]: { engine:0, brakes:0, armour:0 } }
  function getLevels(carId, carUpgrades = {}) {
    const u = carUpgrades[carId] || {};
    return { engine: u.engine || 0, brakes: u.brakes || 0, armour: u.armour || 0 };
  }

  function getNextUpgrade(carId, type, carUpgrades = {}) {
    const levels = getLevels(carId, carUpgrades);
    const cur = levels[type] || 0;
    const defs = UPGRADE_DEFS[type] || [];
    return defs.find(d => d.level === cur + 1) || null;
  }

  function canPurchase(carId, type, money = 0, carUpgrades = {}) {
    const next = getNextUpgrade(carId, type, carUpgrades);
    if (!next) return { ok: false, reason: 'maxed' };
    if (money < next.cost) return { ok: false, reason: 'no_money', cost: next.cost };
    return { ok: true, upgrade: next };
  }

  function purchase(carId, type, money = 0, carUpgrades = {}) {
    const check = canPurchase(carId, type, money, carUpgrades);
    if (!check.ok) return check;
    const next = carUpgrades[carId] ? { ...carUpgrades[carId] } : { engine: 0, brakes: 0, armour: 0 };
    next[type] = (next[type] || 0) + 1;
    return { ok: true, carId, type, level: next[type], upgrade: check.upgrade, cost: check.upgrade.cost, carUpgrades: { ...carUpgrades, [carId]: next } };
  }

  function getCatalog(carId, carUpgrades = {}) {
    const levels = getLevels(carId, carUpgrades);
    return Object.entries(UPGRADE_DEFS).map(([type, defs]) => ({
      type, current: levels[type] || 0, tiers: defs, next: defs.find(d => d.level === (levels[type]||0)+1) || null,
    }));
  }

  return { UPGRADE_DEFS, getLevels, getNextUpgrade, canPurchase, purchase, getCatalog };
}
