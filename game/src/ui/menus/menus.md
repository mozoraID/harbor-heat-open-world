# Menus UI API (`game/src/ui/menus/`)

All modules inject styles via `menuStyles.js` (single `<style id="harbor-heat-menu-styles">`). Each create function returns `{ show(data?), hide(), update(state?) }` and accepts `(rootEl, callbacks = {})`. `show/hide` toggle visibility (`.hh-hidden`); `update(state)` refreshes from game state. Callbacks are optional.

## `menuStyles.js`
- `injectMenuStyles()` – injects shared menu/overlay/phone styles once.

## `titleScreen.js`
- `createTitleScreen(rootEl, callbacks)` → `{ show(data?), hide(), update(state), el }`
- Renders big "HARBOR HEAT" CSS logo (sunset gradient + palm silhouette) and tagline "Port Solenne never sleeps" on the left over a transparent centre (live 3D backdrop shows through). Menu: Continue, New Game, Load Game (3 slot cards: mission %, money, play time), Settings, Controls, Credits.
- Callbacks/events:
  - `onContinue()` – Continue clicked.
  - `onNewGame()` – New Game clicked.
  - `onLoad()` – (reserved) load panel opened; per-slot selection via `onLoadSlot`.
  - `onLoadSlot(slotNumber, slotData)` – a slot card clicked in Load Game.
  - `onSettings()` – (reserved) settings panel opened.
  - `renderSettings(containerEl)` – if provided, called to render settings UI into the title settings panel.
  - `onControls()` – Controls clicked (open controls card).
  - `onCredits()` – (reserved) credits panel opened.
  - `getSlots()` – optional override returning `[{slot, data},...]` (defaults to `saveSlots.listSlots()`).

## `pauseMenu.js`
- `createPauseMenu(rootEl, callbacks)` → `{ show(data?), hide(), update(state), setMapData(data), el }`
- Tabs: **MAP** (full canvas city map from `setMapData({roads,blocks,water})` rects, district names, mission markers, safehouses, shops, legend, player dot), **MISSIONS** (grouped by act with status done/active/locked), **STATS**, **SETTINGS** (volume per channel, mouse sensitivity, invert Y, draw distance, shadows; persisted via `save/settings.js`), **SAVE** (3 slots).
- Callbacks/events:
  - `onResume()` – Resume clicked (menu also hides).
  - `onClose()` – menu hidden/closed.
  - `onSaveSlot(slotNumber)` – save slot selected.
  - `onSettingsChange(settings)` – a setting changed/saved.
  - `getSlots()` – optional slots provider for SAVE tab.
- `setMapData(data)` updates map geometry (same shape as minimap). `show(data)` may include `mapData`, and state fields used: `districts`, `mapMarkers{missions,safehouses,shops}`, `minimap`, `missionGroups`, `stats`, `player`, `rank`, `completedMissions`, `playTime`, `ownedCars`.

## `phone.js`
- `createPhone(rootEl, callbacks)` → `{ show(data?), hide(), update(state), el }`
- Phone on right edge with wallpaper and apps: Contacts (call Mama Inés, Wrench, Sasha Lune), Jobs, Map, Garage, Radio, Messages (story thread). Opens/closes from game (e.g. P key).
- Callbacks/events:
  - `onOpen()` / `onClose()` – phone shown/hidden.
  - `onAppOpen(appId)` – app opened (`contacts|jobs|map|garage|radio|messages`).
  - `onCall(contactId)` – contact CALL tapped (`mama|wrench|sasha`).
  - `onRadioOpen()` – Radio app opened.
- `show/update` data: `contacts`, `jobs`, `ownedCars`, `radioStations`, `radio`, `messages`, `districtName`.

## `wastedScreen.js`
- `createWastedScreen(rootEl, callbacks)` → `{ show(data?), hide(), update(state), el }`
- Big slanted "WASTED" with hospital fee. `show({ fee })`/`update({ wastedFee })`.
- Callbacks: `onRetry()`, `onQuit()`.

## `bustedScreen.js`
- `createBustedScreen(rootEl, callbacks)` → `{ show(data?), hide(), update(state), el }`
- Big slanted "BUSTED" with bribe/fines fee. `show({ fee })`/`update({ bustedFee })`.
- Callbacks: `onRetry()`, `onQuit()`.

## `missionPassed.js`
- `createMissionPassed(rootEl, callbacks)` → `{ show(data?), hide(), update(state), el }`
- "MISSION PASSED" banner with rewards. `show({ title?, cash|money|rewardMoney, respect|rewardRespect, duration? })` auto-hides after `duration` ms (default 4000).
- Callbacks: `onDone()` – fired when auto-hide completes.

## `controlsCard.js`
- `createControlsCard(rootEl, callbacks)` → `{ show(data?), hide(), update(state), el }`
- Controls reference card; `show({ controls })` can override rows (`[action, key]` pairs).
- Callbacks: `onClose()` – closed via X/Close/backdrop.
