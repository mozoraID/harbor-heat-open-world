# Game Flow (`game/src/flow/`)

Owns title → play flow, mission/activity/audio bridges, overlays, save/load, pause/phone, and checklist. **`main.js` is not edited here**; the other session must add the integration lines below.

## Modules
- `gameFlow.js` – `createGameFlow(ctx)` orchestrator (title, play, pause, phone, overlays, save/load/autosave, keys, bridges).
- `titleCamera.js` – `createTitleCamera(app, state)` slow orbiting camera around Marigold Beach at sunset (suppresses chase cam in title).
- `missionBridge.js` – `createMissionBridge(ctx)` runs `missions/missionRunner` each tick, spawns 3D mission markers (glowing cylinders + floating icon via Three.js), exposes giver blips, fills HUD `mission`/`minimap` and `dialogue`, applies rewards, autosave hook.
- `activityBridge.js` – `createActivityBridge(ctx)` starts side activities at markers (taxi, street races, stunt jumps, spray shop, garage) and provides HUD prompts/objectives.
- `audioBridge.js` – `createAudioBridge(ctx)` unlocks on first input, engine sound by car speed, siren when police near/wanted, shot/explosion SFX on state events, in-car radio (switch with R).
- `featureChecklist.js` – `createFeatureChecklist(rootEl)` toggleable panel (key **H**, shown on title) listing game systems.

## `createGameFlow(ctx)` API
`ctx = { state, hud, input, scene, camera, renderer, player, cars, city, mapData, onNewGame, onLoad }`

Returns:
- `update(dt)` – per-tick update (call every sim tick or frame). Drives title camera, bridges, overlays, dialogue timing, wasted/busted detection, pause/phone refresh.
- `isPlaying()` – `true` only during active gameplay (not title/pause/phone/blocking overlay). Use to gate simulation.
- `openPause()` / `openPhone()` – programmatic open.
- `handleEnter(consumed)` – pass through `F/enter` press so activity markers can claim it.
- `titleCamera, audio, mission, activity, mode` – bridge accessors/state.

Behavior:
- Shows **title screen** first over live 3D city with orbit camera; HUD hidden. **Feature checklist** bottom-right (toggle **H**).
- **New Game**: resets player, starts mission 1 **"First Light"** (`act1_first_light`) with intro dialogue.
- **Continue/Load**: reads slots/autosave (`save/saveSlots.js`) and restores money, respect XP/rank, completed missions, position, unlocked weapons; resumes next mission.
- **Esc**: pause menu (MAP, MISSIONS, STATS, SETTINGS, SAVE). **P**: phone. **R**: switch radio station (emits HUD toast). **H**: checklist.
- **Wasted/Busted/Mission Passed** overlays shown from state events (`state.respawn.state` / mission pass callback); autosave after each mission.

## Exact lines `main.js` must add

Add imports near the top (after existing imports):
```js
import { createGameFlow } from './flow/gameFlow.js';
```

After systems/HUD/city/cars setup and before the loop (after `const player = createPlayer(...)` and `hud.setMapData(...)` / `buildMapData` are available), create the flow. Pass the real objects and `mapData`:
```js
  const mapData = buildMapData(state.world.layout);
  const flow = createGameFlow({
    state, hud, input,
    scene: app.scene, camera: app.camera, renderer: app.renderer,
    player, cars: state.cars, city, mapData,
  });
```
(If `hud.setMapData` was already called, keep it; `mapData` must be the same `buildMapData(state.world.layout)` result. Remove or keep the earlier `hud.setMapData(...)` call as desired—flow/pause also need it.)

Gate simulation, camera, and enter handling inside `simulate(dt)` (and keep flow ticking in title). Replace the body logic to respect flow:
```js
  function simulate(dt) {
    state.time += dt;
    input.update();
    flow.update(dt);

    // title / paused / phone: let flow handle camera/overlays, skip gameplay
    if (!flow.isPlaying()) {
      // keep world ambience ticking lightly if desired (optional):
      // if (state.traffic) state.traffic.update(dt, state);
      // if (state.pedestrians) state.pedestrians.update(dt, state);
      // if (state.effects) state.effects.update(dt);
      city.update(dt, state);
      if (state.mode === 'title' && flow.titleCamera) flow.titleCamera.update(dt);
      syncHud(null);
      return;
    }

    if (state.respawn.state) {
      state.respawn.timer -= dt;
      state.hud.objective = state.respawn.label + ' - Respawning...';
      if (state.respawn.timer <= 0) doRespawn();
      if (state.traffic) state.traffic.update(dt, state);
      if (state.pedestrians) state.pedestrians.update(dt, state);
      if (state.effects) state.effects.update(dt);
      if (state.police) state.police.update(dt, state);
      city.update(dt, state);
      updateCamera(app, state, dt);
      syncHud(null);
      return;
    }

    const enter = input.consumeEnter();
    flow.handleEnter(enter); // allow activity markers to claim F
    // only toggle vehicle when not starting an activity prompt/overlay context you want to reserve
    if (enter) tryToggleVehicle(state);
    updateVehicleActions(dt, state, app.scene);
    updateFleeingDrivers(dt, state, app.scene);

    // ... keep existing in-car/on-foot movement, traffic/peds/combat/police/effects/city updates ...
    // ... keep checkWastedBusted(), updateCamera(app,state,dt), prompt + syncHud(prompt) ...
  }
```

Important notes for integrator:
- Do **not** force `state.mode = 'play'` at startup; flow starts in `title` and switches to `play` on New/Continue/Load.
- In shot mode (`?shot=`) you may skip flow/title if desired, or create flow but not show title.
- `flow.update(dt)` must run every tick so audio/radio/bridges stay in sync; when not playing it returns after title/overlay handling.
- `mapData` should be `buildMapData(state.world.layout)` (same shape minimap uses). Pass it to `createGameFlow` so pause map renders.
- The flow listens for **Esc/P/R/H** globally; `R` switches radio and updates `state.radio` for the HUD toast. `F` vehicle toggle remains in main but `flow.handleEnter` lets activities react to marker proximity.
- Mission rewards, dialogue, markers, and autosave are managed by the flow/mission bridge; main should keep `hud.update(state)` via `syncHud` so HUD reflects `state.mission`, `state.dialogue`, `state.minimap.target`, etc.
