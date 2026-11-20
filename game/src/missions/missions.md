# Missions Module API (`game/src/missions/`)

Original Harbor Heat story/mission system. The other session wires this into `main.js`; this folder is self-contained.

## Data

### `characters.js`
- `CHARACTERS` map (ids: `rio,mama,wrench,sasha,kade,quill`): Rio Vance (hero), Mama Inés, Teo "Wrench" Okafor, Sasha Lune, Victor Kade, Detective Mara Quill (SHP). Each `{id,name,role,colour,portraitSeed}` (portraitSeed matches HUD `dialogueBox`).
- `getCharacter(id)`, `getCharacterByName(name)`.

### `story.js`
- `STORY`: 3-act outline — Rio returns to Port Solenne to pay Mama Inés's diner debt to Victor Kade (Act I), gets pulled into Kade's harbour smuggling (Act II), turns on him (Act III). `getAct(n)`.

### `missionDefs/act1.js, act2.js, act3.js, index.js`
- 9 missions total (3/act) with `id,title,number,act,actLabel,giver,giverName,district,reward{money,respect},unlockRequires[],stages[]`.
  - Act I (Marigold Beach/Old Pier/Ferro Docks): `act1_first_light` "First Light", `act1_tide_breaker` "Tide Breaker", `act1_neon_tides` "Neon Tides".
  - Act II (Glasswater Heights/Ferro Docks/Cinder Hills/Lagoon Bridge): `act2_glasswater_job` "Glasswater Job", `act2_ferro_switch` "The Ferro Switch", `act2_lagoon_run` "Lagoon Run".
  - Act III (Cinder Hills/Lagoon Bridge/Glasswater Heights/Old Pier): `act3_kades_ledger` "Kade's Ledger", `act3_breakwater` "Breakwater", `act3_last_call` "Last Call at Pier 9".
- Stage types: `goto` (marker), `steal` (named car), `drive_to` (deliver), `chase` (follow/ram), `escape` (lose wanted), `timed` (reach before time), `shootout` (clear enemies), `photo`, `collect`. Each stage: `type, objective, highlight, next, target{x,z,radius}?`, type params (`carName, requireCar, wantedMax/wantedMinStart, timeLimit, targetCount, collectId`), and `startDialogue/endDialogue {speaker,text}`.
- `ALL_MISSIONS, MISSIONS_BY_ID, getMissionById(id), getMissionsByAct(act), getMissionGroups()`.

### `markers.js`
- `GIVER_BLIPS` (Mama, Wrench, Sasha, Kade, Quill) and `RING_MARKERS` at real block/road positions (from `world/layout.js` grid, e.g. diner -29,319 Marigold Beach; Pier 9 -290,319; Ferro -261,-203; Glasswater 145,29; Lagoon 29,145). Helpers: `getGiverBlip,getRingMarker,getMarkersForDistrict,getAllMapMarkers()`.

## Runner

### `missionRunner.js`
- `createMissionRunner(callbacks={})` → state machine.
  - `startMission(missionId, completedIds=[])` bool (respects `unlockRequires`).
  - `update(gameState, dt)` → HUD patch; checks completion each tick against state (player `{x,z,wanted,inCar}`, `car{name}`, timers, targets `enemiesCleared/kills`, `chaseTarget{destroyed,rammed}/chaseHits/ramImpact/chaseContact`, `photoTaken/photoReady/actionPhoto`).
  - `failMission(reason)`, `completeStage(gameState)`.
  - `getHudState(gameState)` → `{ mission: {number,act,title,stage,stageTotal,objective,highlight,next,timer?}, minimap:{target?} }` (fills HUD `missionPanel`/minimap fields per `ui/hud/hudState.md`).
  - `on(event, fn)` / `callbacks`: events `onStageStart({mission,stage,stageIndex,missionId})`, `onStageComplete(...)`, `onMissionPassed({mission,missionId,reward})`, `onMissionFailed({mission,missionId,reason})`, and `dialogue({dialogue:{visible,speaker,text,role,seed},...})` for dialogueBox lines at stage start/end.
  - Progress: `setProgress(ids)`, `getProgress()`, `canStart(id, completedIds)`, `isActive()`, `getStatus()`, `getActiveMission/Stage()`.

## Side Activities (`sideActivities/`)
Each module small, with start/update/finish and HUD text helpers:
- `taxiFares.js` `createTaxiFares()` → `{start,update(gameState,dt),finish,getHud,isActive,getState}` (pickup/dropoff, fare+tip, timer).
- `streetRaces.js` `createStreetRace(routeId)` / `RACE_ROUTES` (2 routes, 3 rivals, checkpoints) → `{start,update,finish,getHud,isActive,getState,route}`.
- `stuntJumps.js` `createStuntJumps()` / `STUNT_JUMPS` → `{start(jumpId),update,finish,getHud,isActive,isCompleted,getCompleted,setCompleted}`.
- `sprayShop.js` `createSprayShop()` / `SPRAY_SHOPS` → `{getNearest,canUse,getCost,use, getHud}` (pay to clear wanted & repaint).
- `garageUpgrades.js` `createGarageUpgrades()` / `UPGRADE_DEFS` (engine, brakes, armour tiers) → `{getLevels,getNextUpgrade,canPurchase,purchase,getCatalog}`.

## Progression (`progression.js`, integrated with `save/`)
- `RANKS` thresholds/unlocks: Street Rat 0 (fists,bat/Bayline Cruiser), Runner 500 (pistol/Pier Runner), Wheelman 1500 (smg/Solenne Vortex GT), Fixer 3500 (shotgun/Dockside Courier), Kingpin 7000 (rifle/Cinder Coupe).
- `getRankForXp(xp)`, `getNextRank(xp)`, `getRankProgress(xp)`→`{name,xp,next,into,span,pct,maxed}`, `getUnlocksForXp(xp)`→`{weapons,cars}`.
- `applyRewards(saveData,reward{money,respect,completedMissionId?})`→normalized save (money/xp/rank/unlocks/missions updated), `grantRewardsToSlot(slotNumber,reward)`, `getProgressionState(saveData)`.

## HUD integration notes
- Runner emits `mission`/`minimap` matching `ui/hud/hudState.md`; dialogue events carry `{speaker,text,role,seed}` for `dialogueBox`. Markers provide giver/safehouse positions for pause map/minimap.
