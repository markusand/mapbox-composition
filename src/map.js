import { Map } from 'mapbox-gl';
import { debounce } from './utils';

export default async function useMap(container, options = {}) {
	const map = new Map({ container, ...options });
	await map.once('load');

	const resize = new ResizeObserver(debounce(() => map.resize()));
	resize.observe(document.getElementById(container));

	return map;
}
