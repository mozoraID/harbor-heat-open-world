// Persisted game settings for Harbor Heat.
const KEY = 'harborheat.settings';

export function getDefaultSettings() {
  return {
    volume: {
      master: 0.8,
      music: 0.7,
      sfx: 0.8,
      engine: 0.7,
      ui: 0.7,
      radio: 0.75,
    },
    mouseSensitivity: 1.0,
    invertY: false,
    drawDistance: 1.0, // 0.5 low, 1.0 medium, 1.5 high
    shadows: true,
  };
}

export function loadSettings() {
  const def = getDefaultSettings();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return def;
    const s = JSON.parse(raw) || {};
    return {
      ...def,
      ...s,
      volume: { ...def.volume, ...(s.volume || {}) },
      mouseSensitivity: Number.isFinite(Number(s.mouseSensitivity)) ? Number(s.mouseSensitivity) : def.mouseSensitivity,
      invertY: !!s.invertY,
      drawDistance: Number.isFinite(Number(s.drawDistance)) ? Number(s.drawDistance) : def.drawDistance,
      shadows: s.shadows !== false,
    };
  } catch {
    return def;
  }
}

export function saveSettings(settings) {
  const merged = { ...getDefaultSettings(), ...(settings || {}), volume: { ...getDefaultSettings().volume, ...(settings?.volume || {}) } };
  try { localStorage.setItem(KEY, JSON.stringify(merged)); } catch {}
  return merged;
}

export function updateSettings(partial = {}) {
  const cur = loadSettings();
  const next = {
    ...cur,
    ...partial,
    volume: { ...cur.volume, ...(partial.volume || {}) },
  };
  return saveSettings(next);
}
