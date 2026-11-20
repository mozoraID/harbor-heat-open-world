// Health and armour helpers with death/wasted handling hooks.
export function applyDamage(player, amount) {
  let dmg = amount;
  if (player.armour > 0) { const a = Math.min(player.armour, dmg * 0.6); player.armour -= a; dmg -= a; }
  player.health = Math.max(0, player.health - dmg);
  return player.health <= 0;
}
