import { NavigationControl, ScaleControl, GeolocateControl, AttributionControl, FullscreenControl } from 'mapbox-gl';

export default map => {
	const CONTROLS = {};

	const addControl = (name, control, position = 'top-right') => {
		CONTROLS[name] = control;
		map.addControl(control, position);
	};

	const removeControl = name => {
		if (CONTROLS[name]) {
			map.removeControl(CONTROLS[name]);
			delete CONTROLS[name];
		}
	};

	const addNavigation = (config, position) => {
		addControl('navigation', new NavigationControl(config), position);
	};

	const addScale = (config, position) => {
		addControl('scale', new ScaleControl(config), position);
	};

	const addGeolocate = (config, position) => {
		addControl('geolocate', new GeolocateControl(config), position);
	};

	const addAttribution = (config, position) => {
		addControl('attribution', new AttributionControl(config), position);
	};

	const addFullscreen = (config, position) => {
		addControl('fullscreen', new FullscreenControl(config), position);
	};

	const removeNavigation = () => removeControl('navigation');
	const removeScale = () => removeControl('scale');
	const removeGeolocate = () => removeControl('geolocate');
	const removeAttribution = () => removeControl('attribution');
	const removeFullscreen = () => removeControl('fullscreen');

	return {
		addControl,
		removeControl,
		addNavigation,
		addScale,
		addGeolocate,
		addAttribution,
		addFullscreen,
		removeNavigation,
		removeScale,
		removeGeolocate,
		removeAttribution,
		removeFullscreen,
	};
};
