const ACTIONS = ['panBy', 'panTo', 'zoomTo', 'zoomIn', 'zoomOut', 'rotateTo', 'resetNorth', 'snapToNorth', 'fitBounds', 'fitScreenCoordinates', 'jumpTo', 'easeTo', 'flyTo'];

export default function useAsync(map) {
	return ACTIONS.reduce((acc, action) => {
		acc[action] = options => new Promise(resolve => {
			map[action](options);
			map.once('idle', resolve);
		});
		return acc;
	}, {});
}
