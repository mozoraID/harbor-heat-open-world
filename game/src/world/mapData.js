// Builds minimap road/block/water rectangles from the world layout.
export function buildMapData(layout) {
  const roads = [];
  const rw = layout.roadWidth;
  for (let i = 0; i <= layout.n; i++) {
    const x = layout.offsetX + i * layout.cell + rw / 2;
    roads.push({ x, z: 0, w: rw, h: layout.depth });
  }
  for (let j = 0; j <= layout.n; j++) {
    const z = layout.offsetZ + j * layout.cell + rw / 2;
    roads.push({ x: 0, z, w: layout.width, h: rw });
  }
  const blocks = layout.blocks.map((b) => ({ x: b.x, z: b.z, size: b.size }));
  const water = [
    { x: 0, z: layout.depth / 2 + 165, w: layout.width * 2.8, h: 260 },
    { x: -layout.width * 0.28, z: layout.depth / 2 - 15, w: 140, h: 100 },
  ];
  return { roads, blocks, water };
}
