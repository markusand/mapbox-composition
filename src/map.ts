import { Map, MapboxOptions } from 'mapbox-gl';
import type { MapEventHandlers } from './events/events.map';
import { useMapEvents } from './events';
import useControls, {
  ControlName,
  ControlOptions,
  TerrainControlOptions,
  StylesControlOptions,
} from './controls';
import { debounce, capitalize } from './utils';

export type { Map };

type Controls = Record<ControlName, ControlOptions | TerrainControlOptions | StylesControlOptions>;

export type MapOptions = {
  debounceTime?: number;
  controls?: Partial<Controls>;
} & Omit<MapboxOptions, 'container'>
& Partial<MapEventHandlers>;

const defaults: MapOptions = {
  style: 'mapbox://styles/mapbox/light-v10',
  zoom: 15,
  center: [1.531163, 42.508262],
};

export default async (container: string | HTMLElement, options: MapOptions) => {
  const { debounceTime = 100, controls, ...rest } = options;

  const map = new Map({ container, ...defaults, ...rest });
  useMapEvents(map, rest);
  await map.once('load');

  const observed = container instanceof HTMLElement
    ? container
    : document.getElementById(container);
  const resize = debounce(() => map.resize(), debounceTime);
  new ResizeObserver(resize as ResizeObserverCallback).observe(observed as Element);

  if (controls) {
    const controlAdders = useControls(map);
    Object.entries(controls).forEach(([name, params]) => {
      const adder = `add${capitalize(name)}` as `add${Capitalize<ControlName>}`;
      controlAdders[adder]?.(params);
    });
  }

  return map;
};
