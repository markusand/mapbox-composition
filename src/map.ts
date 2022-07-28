import { Map } from 'mapbox-gl';
import type { MapOptions } from './types';
import { useMapEvents } from './events';
import { debounce } from './utils';

export default async (container: string | HTMLElement, options: MapOptions) => {
	const { debounceTime = 100, ...rest } = options;

	const map = new Map({ container, ...rest });
	useMapEvents(map, rest);
	await map.once('load');

	const observed = container instanceof HTMLElement ? container : document.getElementById(container);
	const resize = debounce(() => map.resize(), debounceTime);
	new ResizeObserver(resize as ResizeObserverCallback).observe(observed as Element);

	return map;
};
