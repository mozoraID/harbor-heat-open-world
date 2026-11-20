// District-aware pastel color palettes and trim colors for Port Solenne buildings.
export const PASTELS = [
  { base: '#ff7f6e', trim: '#fff1ec', awning: '#ffb3a7' }, // coral
  { base: '#7fe0c0', trim: '#eafff7', awning: '#b8f2df' }, // mint
  { base: '#ffb88c', trim: '#fff3e6', awning: '#ffd1b0' }, // peach
  { base: '#c9a0ff', trim: '#f5ecff', awning: '#dec2ff' }, // lilac
  { base: '#8fd3ff', trim: '#eef8ff', awning: '#bde6ff' }, // sky
  { base: '#ffe17a', trim: '#fff9d9', awning: '#ffecad' }, // lemon
  { base: '#ff9aa2', trim: '#fff0f1', awning: '#ffc1c7' }, // salmon
  { base: '#4fd1c5', trim: '#e7fffc', awning: '#9debe3' }, // turquoise
  { base: '#f4f1ea', trim: '#ffffff', awning: '#d9d3c7' }, // white art-deco
];

export const DISTRICT_TWEAKS = {
  beach:  { sat: 1.0, bright: 1.0, glass: 0.05 },
  pier:   { sat: 0.95, bright: 0.98, glass: 0.05 },
  heights:{ sat: 0.9, bright: 1.05, glass: 0.55 },
  docks:  { sat: 0.7, bright: 0.9, glass: 0.08 },
  hills:  { sat: 0.95, bright: 1.02, glass: 0.1 },
  bridge: { sat: 0.85, bright: 1.0, glass: 0.3 },
};

export function pickFacade(rng, district) {
  const p = PASTELS[Math.floor(rng() * PASTELS.length)];
  if (district === 'heights' && rng() < 0.6) {
    const blues = ['#dff4ff', '#cfe8ff', '#e8f7ff', '#bfe0ff'];
    return { base: blues[Math.floor(rng() * blues.length)], trim: '#ffffff', awning: '#d9eefc', glassy: true };
  }
  if (district === 'docks' && rng() < 0.5) {
    const inds = ['#9aa6b2', '#b8a894', '#8d99a6', '#c2b59b'];
    return { base: inds[Math.floor(rng() * inds.length)], trim: '#ece7de', awning: '#d8c8b0', glassy: false };
  }
  return { ...p, glassy: false };
}
