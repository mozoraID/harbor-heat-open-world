# Landmarks

Low-poly landmark set for Port Solenne, scaled to real-world size against the city (block size 44m, road 14m, 12x12 grid). All modules use `import * as THREE from 'three'`, canvas textures where needed, and instanced/merged geometry to keep draw calls low.

## Modules (sizes/placement)
- `pierFerrisWheel.js` — Old Pier jutting south into the ocean (south-west, Old Pier district) with deck/planks/pilings/railings/string lights and a ~35m-diameter ferris wheel with coloured gondolas. Returns `{ update(dt), group }`.
- `lighthouse.js` — ~25m red-and-white striped lighthouse on a rocky point at the far/east end of the coast with rotating light beam. Returns `{ update(dt), group }`.
- `marina.js` — docks next to Old Pier with 10 boats (yachts 12–20m, speedboats 6–9m) bobbing on the water. Returns `{ update(dt), group }`.
- `docksCranes.js` — Ferro Docks (north-west): 3 gantry cranes ~40m tall and colourful container stacks (6m containers). Returns `{ update(dt), group }`.
- `lagoonBridge.js` — suspension-style bridge at Lagoon Bridge (east side) with ~45m towers, cables and hangers over the lagoon. Returns `{ update(dt), group }`.
- `billboards.js` — 8 billboards (8x4m boards on 6m posts) on roadsides with canvas-drawn ads: “Vortex GT — Own the Coast”, “Pier 9 Diner — Open 24/7”, “SALT FM Dock Funk 88.4”, “Glasswater Bank”, “Lucky Gull Arcade”, etc. Returns `{ update(dt), group }`.
- `beachLife.js` — Marigold Beach along the whole south beach: boardwalk with food stalls, ~4m lifeguard towers, umbrellas/towels, volleyball nets. Returns `{ update(dt), group }`.
- `hillVillas.js` — villas with pools and terraces on Cinder Hills (north-east). Returns `{ update(dt), group }`.
- `index.js` — `addLandmarks(scene, layout, rng)` calls all modules and returns `{ update(dt) }`.

## Integration
In `game/src/world/city.js` (after city build):
```js
import { addLandmarks } from '../landmarks/index.js';
const landmarks = addLandmarks(scene, layout, state.rng);
```
Exposed on the city object and updated in `city.update(dt, state)` via `landmarks.update(dt)` (no other folder changes needed).

## Preview
`game/landmarks-preview.html` builds ground/sand/ocean, sky, fog, lighting, road-grid hint, and all landmarks with a fixed orbit-ish camera:
`http://localhost:8123/landmarks-preview.html`
