// Save slots: 3 localStorage slots plus autosave for Harbor Heat.
const SLOT_KEY = (n) => `harborheat.slot.${n}`;
const AUTOSAVE_KEY = 'harborheat.slot.autosave';

function nowIso() { return new Date().toISOString(); }

export function emptySlot() {
  return {
    money: 0,
    respectXP: 0,
    rank: 'Street Rat',
    completedMissions: [],
    unlockedWeapons: ['fists'],
    ownedCars: [],
    playerPosition: { x: 0, y: 0, z: 0 },
    playTime: 0, // seconds
    savedAt: null,
  };
}

export function normalizeSlot(data = {}) {
  const base = emptySlot();
  const slot = { ...base, ...data };
  slot.money = Number(slot.money) || 0;
  slot.respectXP = Number(slot.respectXP) || 0;
  slot.rank = typeof slot.rank === 'string' ? slot.rank : base.rank;
  slot.completedMissions = Array.isArray(slot.completedMissions) ? [...slot.completedMissions] : [];
  slot.unlockedWeapons = Array.isArray(slot.unlockedWeapons) ? [...slot.unlockedWeapons] : [...base.unlockedWeapons];
  slot.ownedCars = Array.isArray(slot.ownedCars) ? slot.ownedCars.map(c => (typeof c === 'string' ? c : { ...(c || {}) })) : [];
  const p = slot.playerPosition || {};
  slot.playerPosition = { x: Number(p.x) || 0, y: Number(p.y) || 0, z: Number(p.z) || 0 };
  slot.playTime = Math.max(0, Number(slot.playTime) || 0);
  slot.savedAt = slot.savedAt || null;
  return slot;
}

function safeRead(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return normalizeSlot(JSON.parse(raw));
  } catch {
    return null;
  }
}

function safeWrite(key, data) {
  const slot = normalizeSlot({ ...data, savedAt: data?.savedAt || nowIso() });
  try { localStorage.setItem(key, JSON.stringify(slot)); } catch {}
  return slot;
}

export function getSlot(n) {
  if (n < 1 || n > 3) return null;
  return safeRead(SLOT_KEY(n));
}

export function saveSlot(n, data) {
  if (n < 1 || n > 3) return null;
  return safeWrite(SLOT_KEY(n), data);
}

export function deleteSlot(n) {
  if (n < 1 || n > 3) return;
  try { localStorage.removeItem(SLOT_KEY(n)); } catch {}
}

export function listSlots() {
  return [1, 2, 3].map((n) => ({ slot: n, data: getSlot(n) }));
}

export function autosave(data) {
  return safeWrite(AUTOSAVE_KEY, data);
}

export function loadAutosave() {
  return safeRead(AUTOSAVE_KEY);
}

export function slotSummary(data) {
  if (!data) return null;
  const missionsDone = Array.isArray(data.completedMissions) ? data.completedMissions.length : 0;
  // Assume 20 missions total for percent display when unknown; callers can override via data.missionPercent.
  const total = Number(data.totalMissions) || 20;
  const missionPercent = data.missionPercent != null ? Number(data.missionPercent) : Math.round((missionsDone / Math.max(1, total)) * 100);
  return {
    missionPercent,
    money: Number(data.money) || 0,
    playTime: Math.max(0, Number(data.playTime) || 0),
    savedAt: data.savedAt || null,
    rank: data.rank || 'Street Rat',
  };
}
