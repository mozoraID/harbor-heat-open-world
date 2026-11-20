// Respect XP thresholds, ranks, and unlocks integrated with save module.
import { getSlot, saveSlot, normalizeSlot } from '../save/saveSlots.js';

export const RANKS = [
  { name: 'Street Rat', minXp: 0,    unlocks: { weapons: ['fists','bat'], cars: ['Bayline Cruiser'] } },
  { name: 'Runner',     minXp: 500,  unlocks: { weapons: ['pistol'], cars: ['Pier Runner'] } },
  { name: 'Wheelman',   minXp: 1500, unlocks: { weapons: ['smg'], cars: ['Solenne Vortex GT'] } },
  { name: 'Fixer',      minXp: 3500, unlocks: { weapons: ['shotgun'], cars: ['Dockside Courier'] } },
  { name: 'Kingpin',    minXp: 7000, unlocks: { weapons: ['rifle'], cars: ['Cinder Coupe'] } },
];

export function getRankForXp(xp = 0) {
  let rank = RANKS[0];
  for (const r of RANKS) { if (xp >= r.minXp) rank = r; }
  return rank;
}

export function getNextRank(xp = 0) {
  for (const r of RANKS) { if (xp < r.minXp) return r; }
  return null; // maxed
}

export function getRankProgress(xp = 0) {
  const rank = getRankForXp(xp);
  const next = getNextRank(xp);
  if (!next) return { name: rank.name, xp, next: rank.minXp, into: xp - rank.minXp, span: 1, pct: 1, maxed: true };
  const into = xp - rank.minXp;
  const span = Math.max(1, next.minXp - rank.minXp);
  return { name: rank.name, xp, next: next.minXp, into, span, pct: Math.max(0, Math.min(1, into / span)), maxed: false, nextName: next.name };
}

export function getUnlocksForXp(xp = 0) {
  const weapons = new Set();
  const cars = new Set();
  for (const r of RANKS) {
    if (xp >= r.minXp) {
      (r.unlocks.weapons || []).forEach(w => weapons.add(w));
      (r.unlocks.cars || []).forEach(c => cars.add(c));
    }
  }
  return { weapons: Array.from(weapons), cars: Array.from(cars) };
}

export function applyRewards(saveData = {}, reward = {}) {
  const data = normalizeSlot(saveData);
  data.money = (Number(data.money) || 0) + (Number(reward.money) || 0);
  const prevXp = Number(data.respectXP) || 0;
  data.respectXP = prevXp + (Number(reward.respect) || 0);
  const rankInfo = getRankProgress(data.respectXP);
  data.rank = rankInfo.name;
  const unlocks = getUnlocksForXp(data.respectXP);
  const wset = new Set([...(data.unlockedWeapons || []), ...unlocks.weapons]);
  data.unlockedWeapons = Array.from(wset);
  // owned cars left to game logic, but expose unlock pool
  if (reward.completedMissionId) {
    const set = new Set(data.completedMissions || []);
    set.add(reward.completedMissionId);
    data.completedMissions = Array.from(set);
  }
  data.unlockedPool = unlocks; // informational: all unlocked by rank
  return data;
}

export function grantRewardsToSlot(slotNumber, reward = {}) {
  const cur = getSlot(slotNumber) || {};
  const updated = applyRewards(cur, reward);
  return saveSlot(slotNumber, updated);
}

export function getProgressionState(saveData = {}) {
  const data = normalizeSlot(saveData);
  const xp = Number(data.respectXP) || 0;
  return { ...getRankProgress(xp), unlocks: getUnlocksForXp(xp), money: data.money, completedMissions: data.completedMissions || [] };
}
