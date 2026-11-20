# HUD State Fields

Every widget reads only from the `state` object passed to `update(state)` (plus optional `setMapData` on minimap/root). Missing fields fall back to defaults as noted.

## Core / common
- `state.player` (object)
  - `money` (number, default `0`) – player cash, displayed as `S$` with count-up animation.
  - `wanted` (number 0-5, default `0`) – wanted star count.
  - `health` (number 0-100, default `100`) – health bar.
  - `armour` (number 0-100, default `0`) – armour bar.
  - `x`, `z` (number, default `0`) – world position for minimap.
  - `yaw` (number radians, default `0`) – facing/heading for minimap rotation when on foot.
  - `inCar` (truthy/falsy, default `false`) – whether driving; affects speedo, minimap heading, mode.
  - `activeWeapon` (number 1-6, default `1`) – active weapon slot.
  - `heat` (number 0-1, optional) – progress toward next wanted star; shown in HEAT meter if provided.
- `state.car` (object|null) – current vehicle when `player.inCar`
  - `name` (string, default `"Vehicle"`)
  - `speed` (number, m/s, default `0`) – converted to km/h (*3.6) for speedo/gauge.
  - `condition` (number 0-100, default `100` when in car)
  - `gear` (string|number, default `"D"`)
  - `yaw` (number radians) – heading for minimap when in car.
- `state.speed` (number, m/s, optional fallback) – used if `car.speed` missing.
- `state.districtName` (string, default `"Port Solenne"`) – minimap label and district banner.
- `state.hud` (object, legacy compat)
  - `mission` (string) – fallback mission title.
  - `objective` (string) – fallback objective.

## Time / money display
- `state.timeOfDay` or `state.clock` (string like `"18:42"` or number minutes, default `"18:42"`).

## Mission panel (`mission`)
- `state.mission` (object)
  - `number` (number, default `1`)
  - `act` (string, default `"ACT I"`)
  - `title` (string, fallback `state.hud.mission`/`"Harbor Heat"`)
  - `stage` (number, default `1`) – active stage (1-based).
  - `stageTotal` (number, default `1`) – total stage pips.
  - `objective` (string, fallback `state.hud.objective`)
  - `highlight` (string, optional) – keyword in objective to highlight in gold.
  - `next` (string, optional) – "NEXT" line text.
  - `timer` (number seconds, optional) – shown in header; drives thin stage-timer progress bar (auto-scales to first/max seen value per mission/stage; turns red when low).

## Dispatch panel (`dispatch`)
- `state.dispatch` (object)
  - `visible` (boolean, default `true`)
  - `stars` (number, fallback `state.player.wanted`)
  - `units` (array, default `[]`, first 4 shown) of:
    - `callSign` or `callsign` (string, e.g. `"GULL-11"`)
    - `distance` (number metres)
    - `tag` (string: `RAMMING|PIT|FLANKING|ROADBLOCK|SPOTLIGHT|PURSUIT|SEARCHING`)
    - `type` (string, optional: `cruiser|interceptor|armoured|helicopter`) – selects canvas icon (otherwise inferred from callsign/tag).
  - `more` (number, default remaining beyond 4 shown) – "+N more" count.
  - `roadblock` (boolean, optional) – forces "ROADBLOCK AHEAD" footer (also shown if any unit tag is ROADBLOCK).

## Wanted/status (`wanted`)
- `state.wanted.searching` (boolean, default `false`) – flashes stars during search.
- `state.wanted.status` or `state.statusLine` (string, optional) – e.g. `"AIR UNIT OVERHEAD"`, `"LOST THEM IN 0:12"`.
- `state.wanted.heat` or `state.wanted.progress` (number 0-1, optional) – progress toward next star for HEAT meter. Falls back to fractional part of `player.wanted` if > current whole stars.

## Weapons (`weapons`, `activeWeapon`)
- `state.weapons` (array, optional; defaults to 6 built-in slots) of:
  - `slot` (1-6)
  - `id` (`fists|bat|pistol|smg|shotgun|rifle`)
  - `name` (string)
  - `ammo` (`[clip,reserve]` or number or null)
  - `owned` (boolean, default `true`) / `locked` (boolean) – dimmed when not owned/locked.
- `state.player.activeWeapon` or `state.activeWeapon` (number 1-6).

## Rank (`rank`)
- `state.rank` (object)
  - `name` (string, default `"Street Rat"`) – e.g. Street Rat, Runner, Wheelman, Fixer, Kingpin.
  - `xp` (number, default `0`)
  - `next` (number, default `100`) – XP needed for bar.

## Minimap (`minimap`) and map data
- `state.minimap` (object)
  - `target` ({`x`,`z`} | null) – mission target blip (yellow).
  - `shops` (array of {`x`,`z`,`letter`/`label`}) – shop letter blips.
  - `police` (array of {`x`,`z`,`yaw`/`heading`}) – red/blue flashing dots with vision cones.
- `setMapData({roads, blocks, water, districts?, labels?})` called on system/minimap: roads/blocks/water are arrays of simple rectangles in world metres. Accepted rect forms: `{x,z,w,h|d}` or `{x,z,width,height|depth}` or `{x,z,size}` or `{x1,z1,x2,z2}`.
  - `districts` or `labels` (array of {`name`/`label`,`x`,`z`}, optional) – district label positions; defaults to real districts (Marigold Beach, Old Pier, Glasswater Heights, Ferro Docks, Cinder Hills, Lagoon Bridge).

## Radio (`radio`)
- `state.radio` (string or object|falsey)
  - if object: `station`, `genre`, `track`, `visible` (default true). Renders as `♪ STATION — Genre · 'Track'`.

## Dialogue (`dialogue`)
- `state.dialogue` (object)
  - `visible` (boolean, default true when text/speaker present)
  - `speaker`/`name` (string) – also selects portrait profile/seed.
  - `role` (string, optional; falls back to character profile role)
  - `text` (string) – revealed with typewriter effect.
  - `seed` (string, optional) – portrait seed override.
  - `typeSpeed` (number chars/sec, default `45`).

## Notifications
- `state.notifications` or `state.toasts` (array) – last 5 shown. Item string or `{text, tone?}` (`coral|mint|gold`).

## Crosshair / interact / prompt
- `state.crosshair` (boolean, default `true`) – hidden automatically during dialogue.
- `state.interact` or `state.prompt` (string or object|falsey)
  - if object: `key` (default `"F"`), `action`/`text`.

## District banner
- Uses `state.districtName`; banner fades in on change (no extra field required).
