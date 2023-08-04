import { Map, type MapboxOptions } from 'mapbox-gl';
import { useMapEvents, type MapEventHandlers } from './events';
import { useControls, type ControlsOptions } from './controls';
import { capitalize, debounce } from './utils';

export type MapOptions = {
  controls?: Partial<ControlsOptions>;
  debounce?: number;
} & Omit<MapboxOptions, 'container'> & Partial<MapEventHandlers>;

const useMapResizer = (map: Map, el: string | HTMLElement, debounceTime?: number) => {
  const observer = new ResizeObserver(debounce(([entry]) => {
    if (entry.target.classList.contains('mapboxgl-map')) map.resize();
    else observer.disconnect();
  }, debounceTime || 13));
  const observed = typeof el === 'string' ? document.getElementById(el) : el;
  if (observed) observer.observe(observed);
};

export const createMap = async (container: string | HTMLElement, options: MapOptions) => {
  const { controls, ...mapOptions } = options;

  const map = new Map({
    container,
    style: 'mapbox://styles/mapbox/streets-v12',
    ...mapOptions,
  });
  await map.once('load');

  useMapEvents(map, mapOptions);
  useMapResizer(map, container, options.debounce);

  if (controls) {
    const adders = useControls(map);
    Object.entries(controls).forEach(([name, params]) => {
      const adder = `add${capitalize(name)}` as `add${Capitalize<keyof ControlsOptions>}`;
      adders[adder]?.(params);
    });
  }

  return map;
};
