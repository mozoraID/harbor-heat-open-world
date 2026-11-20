# Ambient systems

Day/night cycle and ambient effects for Port Solenne. Modules live in `game/src/ambient/` and use `import * as THREE from 'three'`.

## Modules
- `dayNight.js` — drives in-game clock at **1 real second = 1 game minute**. Interpolates sun direction/colour/intensity, hemisphere light, sky shader uniforms (`top/mid/horizon/glow/sunDir`), fog colour/density, and ambient light through dawn/day/golden hour/dusk/night. Exposes `setTime(hours, opts?)` (and `opts.freeze` to pin) so shots can fix a time (e.g. `setTime(18.7, {freeze:true})` for 18:42).
- `streetLights.js` — lamp heads (props emissive) and building windows (emissive glow via texture) turn on after ~19:00 and fade at dawn; a few pooled point lights create sidewalk light pools near the player.
- `neonSigns.js` — shop signs and billboards gain stronger emissive neon at night with soft flicker.
- `birdsAndClouds.js` — slowly drifting low-poly clouds and gulls circling over Marigold Beach.
- `waterSparkle.js` — sun glitter sprites on the ocean near the horizon at golden hour (and subtle morning).
- `index.js` — `addAmbient(ctx) -> { update(dt, state), setTime(hours, opts), dayNight }` wires all modules.

## Integration (minimal hook in `game/src/world/city.js`)
```js
import { addAmbient } from '../ambient/index.js';
// after sky/buildings/props/landmarks are built:
const ambient = addAmbient({ scene, state, sky, buildings, props, layout, city: { layout, sky, ground, buildings, props, water, landmarks } });
// expose and update:
return { ..., ambient, update(dt, state) { water.update(dt); if (landmarks?.update) landmarks.update(dt); if (ambient?.update) ambient.update(dt, state); sky.update(dt, { x: p.x, y: p.y, z: p.z }); } };
```

## Pinned shot times
Screenshot shots (`?shot=...`) go through `game/src/shots/shotDirector.js`, which updates water directly and does **not** call `city.update(...)`, so ambient/day-night does not advance during shots and the original sky/lighting remains intact. Shot HUD labels (e.g. `18:42 Golden Hour`) continue to come from each shot's `hudExtra().timeLabel`. To pin via ambient explicitly, call `city.ambient.setTime(18.7, { freeze: true })`.
