// Mission giver blips and glowing ring marker data (world metres from layout.js positions).
// Positions derived from real block/road grid: cell=58, n=12, offsets ~ -348 to +348.

export const GIVER_BLIPS = [
  { id: 'mama', characterId: 'mama', name: 'Mama Inés', x: -29, z: 319, district: 'Marigold Beach', label: 'M', color: '#ffcc4d' },
  { id: 'wrench', characterId: 'wrench', name: 'Teo "Wrench" Okafor', x: -203, z: 203, district: 'Old Pier', label: 'W', color: '#5cc8ff' },
  { id: 'sasha', characterId: 'sasha', name: 'Sasha Lune', x: -145, z: 261, district: 'Old Pier', label: 'S', color: '#ff7ad1' },
  { id: 'kade', characterId: 'kade', name: 'Victor Kade', x: 145, z: 29, district: 'Glasswater Heights', label: 'K', color: '#ff6b5a' },
  { id: 'quill', characterId: 'quill', name: 'Detective Mara Quill', x: 87, z: -29, district: 'Cinder Hills', label: 'Q', color: '#9aa6b2' },
];

// Glowing ring markers for key mission locations (aligned to blocks/roads from layout)
export const RING_MARKERS = [
  { id: 'diner', name: "Mama's Diner", x: -29, z: 319, radius: 10, district: 'Marigold Beach', color: '#ffcc4d' },
  { id: 'old_pier_drop', name: 'Old Pier Drop', x: -261, z: 261, radius: 10, district: 'Old Pier', color: '#5cc8ff' },
  { id: 'pier_marina', name: 'Marigold Marina', x: -145, z: 261, radius: 10, district: 'Old Pier', color: '#ff7ad1' },
  { id: 'ferro_cranes', name: 'Ferro Cranes', x: -261, z: -203, radius: 12, district: 'Ferro Docks', color: '#5cc8ff' },
  { id: 'glasswater_lookout', name: 'Glasswater Lookout', x: 145, z: 29, radius: 10, district: 'Glasswater Heights', color: '#ff6b5a' },
  { id: 'cinder_stash', name: 'Cinder Stash', x: 203, z: -145, radius: 10, district: 'Cinder Hills', color: '#ff6b5a' },
  { id: 'lagoon_crossing', name: 'Lagoon Crossing', x: 29, z: 145, radius: 12, district: 'Lagoon Bridge', color: '#3ee6b0' },
  { id: 'pier9', name: 'Pier 9', x: -290, z: 319, radius: 12, district: 'Old Pier', color: '#ffcc4d' },
  { id: 'marigold_safehouse', name: 'Marigold Safehouse', x: -87, z: 261, radius: 10, district: 'Marigold Beach', color: '#3ee6b0' },
  { id: 'ferro_lockup', name: 'Ferro Lockup', x: -319, z: -261, radius: 10, district: 'Ferro Docks', color: '#5cc8ff' },
];

export function getGiverBlip(id) { return GIVER_BLIPS.find(b => b.id === id) || null; }
export function getRingMarker(id) { return RING_MARKERS.find(m => m.id === id) || null; }
export function getMarkersForDistrict(district) {
  return {
    givers: GIVER_BLIPS.filter(b => b.district === district),
    rings: RING_MARKERS.filter(m => m.district === district),
  };
}
export function getAllMapMarkers() {
  return {
    givers: GIVER_BLIPS.map(b => ({ x: b.x, z: b.z, label: b.label, color: b.color, name: b.name })),
    safehouses: RING_MARKERS.filter(m => m.id.includes('safehouse') || m.id === 'diner').map(m => ({ x: m.x, z: m.z, name: m.name })),
  };
}
