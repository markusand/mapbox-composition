export const ACTIONS = ['panBy', 'panTo', 'zoomTo', 'zoomIn', 'zoomOut', 'rotateTo', 'resetNorth', 'snapToNorth', 'fitBounds', 'fitScreenCoordinates', 'jumpTo', 'easeTo', 'flyTo'];

export default (map, actions = ACTIONS) => actions.reduce((acc, action) => {
	const eventName = action.toLowerCase();
	acc[action] = (...options) => new Promise(resolve => {
		map[action](...options);
		map.fire(`${eventName}start`);
		map.once('moveend', event => {
			map.fire(`${eventName}end`);
			resolve(event);
		});
	});
	return acc;
}, {});
