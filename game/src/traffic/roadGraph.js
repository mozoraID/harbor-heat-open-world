// Builds a simple road graph from layout blocks for traffic routing.
export function buildRoadGraph(layout) {
  const nodes = [];
  const edges = [];
  const rw = layout.roadWidth;
  for (let j = 0; j <= layout.n; j++) {
    for (let i = 0; i <= layout.n; i++) {
      const x = layout.offsetX + i * layout.cell + rw / 2;
      const z = layout.offsetZ + j * layout.cell + rw / 2;
      nodes.push({ i, j, x, z, id: nodes.length });
    }
  }
  const idx = (i, j) => j * (layout.n + 1) + i;
  for (let j = 0; j <= layout.n; j++) {
    for (let i = 0; i <= layout.n; i++) {
      const a = nodes[idx(i, j)];
      if (i < layout.n) { const b = nodes[idx(i + 1, j)]; edges.push({ a, b, len: Math.hypot(b.x - a.x, b.z - a.z) }); edges.push({ a: b, b: a, len: Math.hypot(b.x - a.x, b.z - a.z) }); }
      if (j < layout.n) { const b = nodes[idx(i, j + 1)]; edges.push({ a, b, len: Math.hypot(b.x - a.x, b.z - a.z) }); edges.push({ a: b, b: a, len: Math.hypot(b.x - a.x, b.z - a.z) }); }
    }
  }
  const outgoing = new Map();
  for (const e of edges) {
    if (!outgoing.has(e.a.id)) outgoing.set(e.a.id, []);
    outgoing.get(e.a.id).push(e);
  }
  return { nodes, edges, outgoing };
}
