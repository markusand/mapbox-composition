import { Popup } from 'mapbox-gl';
import { usePopupEvents } from './events';
import { uuid } from './utils';

export default (...args) => {
	const [map, options = {}] = args.length === 1 ? [, args[0]] : args;
	const { content, coordinates, name = `popup-${uuid()}`, ...rest } = options;
	const { bindPopupEvents } = usePopupEvents(options);

	const popup = new Popup(rest);

	const setLocation = coords => popup.setLngLat(coords).addTo(map);
	const setContent = newContent => popup.setHTML(newContent);

	// Instantiate
	if (coordinates) setLocation(coordinates);
	setContent(content || `<div id="${name}"></div>`);
	bindPopupEvents(popup);

	return {
		get popup() { return popup; },
		name,
		setLocation,
		setContent,
	};
};
