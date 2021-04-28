import { Map } from 'mapbox-gl';

export default async function useMap(container, options = {}) {
	const map = new Map({ container, ...options });
	await map.once('load');
	return map;
}
