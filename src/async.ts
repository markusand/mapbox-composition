import type { Map, MapboxEvent, EventData } from 'mapbox-gl';

const ACTIONS = ['panBy', 'panTo', 'zoomTo', 'zoomIn', 'zoomOut', 'rotateTo', 'resetNorth', 'snapToNorth', 'fitBounds', 'fitScreenCoordinates', 'jumpTo', 'easeTo', 'flyTo'] as const;

type Event = MapboxEvent<MouseEvent | TouchEvent | WheelEvent | undefined> & EventData;
type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

type AsyncActionArguments = ArgumentTypes<Map[typeof ACTIONS[number]]>;

export default (map: Map, actions = ACTIONS) => actions.reduce((acc, action) => {
  const eventName = action.toLowerCase();
  acc[action] = (...options: AsyncActionArguments) => new Promise(resolve => {
    // @ts-ignore
    map[action](...options);
    map.fire(`${eventName}start`);
    map.once('moveend', (event: Event) => {
      map.fire(`${eventName}end`);
      resolve(event);
    });
  });
  return acc;
}, {} as Record<typeof ACTIONS[number], (...options: AsyncActionArguments) => Promise<Event>>);
