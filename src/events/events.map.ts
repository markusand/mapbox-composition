import type { Map, MapEventType } from 'mapbox-gl';

export type MapEventHandlers = {
  [k in keyof MapEventType as `on${Capitalize<k>}`]: (event: MapEventType[k]) => void;
};

export const useMapEvents = (map: Map, options: Partial<MapEventHandlers>) => {
  Object.entries(options).forEach(([key, callback]) => {
    if (key.startsWith('on')) {
      const event = key.slice(2).toLowerCase();
      map.on(event, callback);
    }
  });
};
