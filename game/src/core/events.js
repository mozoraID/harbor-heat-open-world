// Simple event bus for decoupled communication between game systems.
export function createEvents() {
  const map = new Map();
  return {
    on(type, fn) {
      if (!map.has(type)) map.set(type, new Set());
      map.get(type).add(fn);
      return () => this.off(type, fn);
    },
    off(type, fn) {
      const set = map.get(type);
      if (set) set.delete(fn);
    },
    emit(type, data) {
      const set = map.get(type);
      if (!set) return;
      for (const fn of set) fn(data);
    },
  };
}
