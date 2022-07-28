import { Marker } from 'mapbox-gl';
import { useMarkerEvents } from './events';

export default (map, options = {}) => {
	const { coordinates, popup, ...rest } = options;
	const { bindMarkerEvents } = useMarkerEvents(options);

	const marker = new Marker({ ...rest });
	let markerPopup;

	const setLocation = coords => marker.setLngLat(coords).addTo(map);
	const setPopup = newPopup => {
		markerPopup = newPopup;
		marker.setPopup(newPopup.popup);
	};

	// Instantiate
	if (popup) setPopup(popup);
	setLocation(coordinates);
	bindMarkerEvents(marker);

	return {
		setLocation,
		get marker() { return marker; },
		get popup() { return markerPopup; },
		set popup(newPopup) { setPopup(newPopup); },
	};
};
