// Music system: plays procedural radio stations and emits now-playing info.
import { getContext, getChannel } from './audioEngine.js';
import { stations, getStation } from './radioStations.js';

export function createMusic(onChange) {
  let index = 0;
  let playing = false;

  function emit() {
    const s = getStation(index);
    const song = s.currentSong ? s.currentSong() : s.songs[0];
    onChange && onChange({ station: s.name, genre: s.genre, track: song?.title || '', index, id: s.id });
  }

  function play(i = index) {
    index = ((i % stations.length) + stations.length) % stations.length;
    const ctx = getContext(); if (!ctx) { emit(); return; }
    stations.forEach((s, idx) => { if (idx !== index) s.stop(); });
    getStation(index).start(getChannel('radio'));
    playing = true;
    emit();
  }

  function stop() { stations.forEach(s => s.stop()); playing = false; }
  function next() { play(index + 1); }
  function prev() { play(index - 1); }
  function toggle(i) { if (playing && (i==null || i===index)) stop(); else play(i ?? index); }
  function getCurrent() { const s = getStation(index); return { station:s.name, genre:s.genre, track:(s.currentSong?s.currentSong():s.songs[0])?.title||'', index, id:s.id, playing }; }
  function update() { /* sequencers run on timers */ }

  return { play, stop, next, prev, toggle, getCurrent, update, stations };
}
