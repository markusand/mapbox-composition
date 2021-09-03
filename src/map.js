import { Map } from 'mapbox-gl';
import { useMapEvents } from './events';
import { debounce } from './utils';

export default async function useMap(container, options = {}) {
	const map = new Map({ container, ...options });
	useMapEvents(map, options);
	await map.once('load');

	const resize = new ResizeObserver(debounce(() => map.resize()));
	resize.observe(document.getElementById(container));

	return map;
}
