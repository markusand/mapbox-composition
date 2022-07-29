import { Map } from 'mapbox-gl';
import type { MapboxOptions } from 'mapbox-gl';
import type { MapEventHandlers } from './events/events.map';
import { useMapEvents } from './events';
import { debounce } from './utils';

type MapOptions = Omit<MapboxOptions, 'container'>
& Partial<MapEventHandlers>
& { debounceTime?: number };

export default async (container: string | HTMLElement, options: MapOptions) => {
  const { debounceTime = 100, ...rest } = options;

  const map = new Map({ container, ...rest });
  useMapEvents(map, rest);
  await map.once('load');

  const observed = container instanceof HTMLElement
    ? container :
    document.getElementById(container);
  const resize = debounce(() => map.resize(), debounceTime);
  new ResizeObserver(resize as ResizeObserverCallback).observe(observed as Element);

  return map;
};
