import type { Map, MapEventType } from 'mapbox-gl';

type EventType = keyof MapEventType;
type Event = MapEventType[EventType];
export type MapEventHandlers = Record<`on${Capitalize<EventType>}`, (event: Event) => void>;

export default (map: Map, options: Partial<MapEventHandlers>) => {
  Object.entries(options).forEach(([key, callback]) => {
    if (key.startsWith('on')) {
      const event = key.slice(2).toLowerCase();
      map.on(event, callback);
    }
  });
};
