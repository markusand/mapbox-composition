import type { Map } from 'mapbox-gl';
import type { MapEventHandlers } from '../types';

export default (map: Map, options: Partial<MapEventHandlers>) => {
  Object.entries(options).forEach(([key, callback]) => {
    if (key.startsWith('on')) {
      const event = key.slice(2).toLowerCase();
      map.on(event, callback);
    }
  });
};
