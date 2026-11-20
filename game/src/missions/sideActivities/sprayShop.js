// Spray shop side activity: pay to clear wanted level and repaint car.
export const SPRAY_SHOPS = [
  { id: 'spray_beach', name: 'Marigold Spray', x: -87, z: 290, district: 'Marigold Beach', baseCost: 300 },
  { id: 'spray_docks', name: 'Ferro Respray', x: -203, z: -261, district: 'Ferro Docks', baseCost: 350 },
  { id: 'spray_heights', name: 'Glasswater Finish', x: 203, z: 87, district: 'Glasswater Heights', baseCost: 400 },
];

export function createSprayShop() {
  function getNearest(player) {
    if (!player) return null;
    let best=null,bd=Infinity;
    for (const s of SPRAY_SHOPS) { const dx=player.x-s.x,dz=player.z-s.z; const d=dx*dx+dz*dz; if(d<bd){bd=d;best=s;} }
    return best ? { ...best, distance: Math.sqrt(bd) } : null;
  }

  function canUse(gameState = {}) {
    const p = gameState.player || {};
    const near = getNearest(p);
    return !!(near && near.distance < 12 && p.inCar);
  }

  function getCost(gameState = {}) {
    const p = gameState.player || {};
    const near = getNearest(p) || SPRAY_SHOPS[0];
    const wanted = p.wanted || 0;
    return near.baseCost + wanted * 250;
  }

  function use(gameState = {}, options = {}) {
    if (!canUse(gameState)) return { ok: false, reason: 'not_available' };
    const cost = getCost(gameState);
    const money = gameState.player?.money ?? 0;
    if (money < cost) return { ok: false, reason: 'no_money', cost };
    const color = options.color || ['Crimson','Midnight','Sunset','Teal','Pearl'][Math.floor(Math.random()*5)];
    // caller applies: deduct money, set wanted 0, set car color
    return { ok: true, cost, color, wantedCleared: true, shop: getNearest(gameState.player) };
  }

  function getHud(gameState = {}) {
    const near = getNearest(gameState?.player);
    if (!near || near.distance > 20) return null;
    return { prompt: near.distance < 12 ? { key: 'F', action: `Respray & Clear Wanted (S$ ${getCost(gameState)})` } : null, shop: near };
  }

  return { SPRAY_SHOPS, getNearest, canUse, getCost, use, getHud };
}
