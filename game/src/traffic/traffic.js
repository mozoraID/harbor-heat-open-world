// Spawns and updates ambient traffic cars driving on the road graph.
import { buildRoadGraph } from './roadGraph.js';
import { createTrafficCar, updateTrafficCar } from './trafficCar.js';

export function createTraffic(scene, state, count = 30) {
  const graph = buildRoadGraph(state.world.layout);
  const cars = [];
  for (let i = 0; i < count; i++) cars.push(createTrafficCar(scene, state, graph));
  function update(dt, state) {
    for (const car of cars) updateTrafficCar(car, dt, state, graph, cars);
  }
  return { cars, update, graph };
}
