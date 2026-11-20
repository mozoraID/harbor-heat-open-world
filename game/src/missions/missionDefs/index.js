// Aggregated mission definitions across all acts.
import { ACT1_MISSIONS } from './act1.js';
import { ACT2_MISSIONS } from './act2.js';
import { ACT3_MISSIONS } from './act3.js';

export const ALL_MISSIONS = [...ACT1_MISSIONS, ...ACT2_MISSIONS, ...ACT3_MISSIONS];
export const MISSIONS_BY_ID = Object.fromEntries(ALL_MISSIONS.map(m => [m.id, m]));

export function getMissionById(id) { return MISSIONS_BY_ID[id] || null; }
export function getMissionsByAct(act) { return ALL_MISSIONS.filter(m => m.act === act); }
export function getMissionGroups() {
  return [
    { act: 'Act I', actNumber: 1, missions: ACT1_MISSIONS },
    { act: 'Act II', actNumber: 2, missions: ACT2_MISSIONS },
    { act: 'Act III', actNumber: 3, missions: ACT3_MISSIONS },
  ];
}
