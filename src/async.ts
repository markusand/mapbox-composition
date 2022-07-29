import type { Map } from 'mapbox-gl';

export const ACTIONS = ['panBy', 'panTo', 'zoomTo', 'zoomIn', 'zoomOut', 'rotateTo', 'resetNorth', 'snapToNorth', 'fitBounds', 'fitScreenCoordinates', 'jumpTo', 'easeTo', 'flyTo'] as const;

export default (map: Map, actions = ACTIONS) => actions.reduce((acc, action) => {
	const eventName = action.toLowerCase();
	acc[action] = (...options: any[]) => new Promise(resolve => {
		(map[action] as any)(...options);
		map.fire(`${eventName}start`);
		map.once('moveend', event => {
			map.fire(`${eventName}end`);
			resolve(event);
		});
	});
	return acc;
}, {} as Record<typeof ACTIONS[number], any>);
