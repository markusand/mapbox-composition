import type { Map, MapboxEvent, EventData } from 'mapbox-gl';

type Event = MapboxEvent<MouseEvent | TouchEvent | WheelEvent | undefined> & EventData;

const ACTIONS = ['panBy', 'panTo', 'zoomTo', 'zoomIn', 'zoomOut', 'rotateTo', 'resetNorth', 'snapToNorth', 'fitBounds', 'fitScreenCoordinates', 'jumpTo', 'easeTo', 'flyTo'] as const;

export default (map: Map, actions = ACTIONS) => actions.reduce((acc, action) => {
  const eventName = action.toLowerCase();
  acc[action] = (...options: any[]) => new Promise(resolve => {
    (map[action] as any)(...options);
    map.fire(`${eventName}start`);
    map.once('moveend', (event: Event) => {
      map.fire(`${eventName}end`);
      resolve(event);
    });
  });
  return acc;
}, {} as Record<typeof ACTIONS[number], (...options: any[]) => Promise<Event>>);
