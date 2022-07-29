import type { Map, MapEventType, EventData } from 'mapbox-gl';

export type MapEventHandlers = Record<
`on${Capitalize<keyof MapEventType>}`,
(event: MapEventType & EventData) => void
>;

export default (map: Map, options: Partial<MapEventHandlers>) => {
  Object.entries(options).forEach(([key, callback]) => {
    if (key.startsWith('on')) {
      const event = key.slice(2).toLowerCase();
      map.on(event, callback);
    }
  });
};
