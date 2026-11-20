# Landmarks

Low-poly landmark set for Port Solenne. All modules use `import * as THREE from 'three'`, canvas textures where needed, and instanced/merged geometry to keep draw calls low.

## Modules
- `pierFerrisWheel.js` — Old Pier (south/west, jutting into ocean) with deck planks, pilings, railings, string lights, and a slowly turning ferris wheel with coloured gondolas. Returns `{ update(dt), group }`.
- `lighthouse.js` — red-and-white striped lighthouse on a rocky ocean point with rotating light beam. Returns `{ update(dt), group }`.
- `marina.js` — lagoon docks with 10 yachts/speedboats of different sizes bobbing on the water. Returns `{ update(dt), group }`.
- `docksCranes.js` — Ferro Docks: 3 gantry cranes and colourful container stacks. Returns `{ update(dt), group }`.
- `lagoonBridge.js` — suspension-style bridge with two towers and cables over the lagoon. Returns `{ update(dt), group }`.
- `billboards.js` — 8 rooftop/roadside billboards with invented canvas-drawn ads. Returns `{ update(dt), group }`.
- `beachLife.js` — Marigold Beach: lifeguard towers, umbrellas, towels, volleyball net, boardwalk and food stalls. Returns `{ update(dt), group }`.
- `hillVillas.js` — Cinder Hills villas with pools and terraces. Returns `{ update(dt), group }`.
- `index.js` — `addLandmarks(scene, layout, rng)` calls all modules and returns `{ update(dt) }`.

## One-line integration
In `main.js` or `world/city.js` (after scene/layout creation): 
```js
import { addLandmarks } from './landmarks/index.js';
const landmarks = addLandmarks(scene, layout, rng);
```
Then in the frame loop: `landmarks.update(dt);`

## Preview
`game/landmarks-preview.html` builds a ground plane, sky, fog, basic lighting, fixed orbit-ish camera, and all landmarks for isolated testing:
`http://localhost:8123/landmarks-preview.html`
