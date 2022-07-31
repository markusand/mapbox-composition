import { Map } from 'mapbox-gl';
import type { MapboxOptions } from 'mapbox-gl';
import type { MapEventHandlers } from './events/events.map';
import { useMapEvents } from './events';
import useControls, { ControlName, ControlOptions } from './controls';
import type { TerrainControlOptions } from './controls/TerrainControl';
import type { StylesControlOptions } from './controls/StylesControl';
import { debounce, capitalize } from './utils';

type Controls = Record<ControlName, ControlOptions | TerrainControlOptions | StylesControlOptions>;
type MapOptions = {
  debounceTime?: number;
  controls?: Partial<Controls>;
} & Omit<MapboxOptions, 'container'>
& Partial<MapEventHandlers>;

export default async (container: string | HTMLElement, options: MapOptions) => {
  const { debounceTime = 100, controls, ...rest } = options;

  const map = new Map({ container, ...rest });
  useMapEvents(map, rest);
  await map.once('load');

  const observed = container instanceof HTMLElement
    ? container :
    document.getElementById(container);
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
