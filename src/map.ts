import { Map, type MapboxOptions } from 'mapbox-gl';
import { useMapEvents, type MapEventHandlers } from './events';
import useControls, {
  type ControlName,
  type ControlOptions,
  type TerrainControlOptions,
  type StylesControlOptions,
} from './controls';
import { capitalize, debounce } from './utils';

type Controls = Record<ControlName, ControlOptions | TerrainControlOptions | StylesControlOptions>;

export type MapOptions = {
  controls?: Partial<Controls>;
  debounce?: number;
} & Omit<MapboxOptions, 'container'>
& Partial<MapEventHandlers>;

const useMapResizer = (map: Map, el: string | HTMLElement, debounceTime?: number) => {
  const observer = new ResizeObserver(debounce(([entry]) => {
    if (entry.target.classList.contains('mapboxgl-map')) map.resize();
    else observer.disconnect();
  }, debounceTime || 200));
  const observed = typeof el === 'string' ? document.getElementById(el) : el;
  if (observed) observer.observe(observed);
};

export default async (container: string | HTMLElement, options: MapOptions) => {
  const { controls, ...mapOptions } = options;

  const map = new Map({ container, ...mapOptions });
  await map.once('load');

  useMapEvents(map, mapOptions);
  useMapResizer(map, container, options.debounce);

  if (controls) {
    const controlAdders = useControls(map);
    Object.entries(controls).forEach(([name, params]) => {
      const adder = `add${capitalize(name)}` as `add${Capitalize<ControlName>}`;
      controlAdders[adder]?.(params);
    });
  }

  return map;
};
