import { NavigationControl, ScaleControl, GeolocateControl, AttributionControl, FullscreenControl } from 'mapbox-gl';
import StylesControl from './StylesControl';
import TerrainControl from './TerrainControl';

export default map => {
	const CONTROLS = {};

	const addControl = (name, position, control) => {
		CONTROLS[name] = control;
		map.addControl(control, position);
	};

	const removeControl = name => {
		if (CONTROLS[name]) {
			map.removeControl(CONTROLS[name]);
			delete CONTROLS[name];
		}
	};

	const addNavigation = ({ position = 'top-right', ...config } = {}) => {
		addControl('navigation', position, new NavigationControl(config));
	};

	const addScale = ({ position = 'bottom-left', ...config } = {}) => {
		addControl('scale', position, new ScaleControl(config));
	};

	const addGeolocate = ({ position = 'top-right', ...config } = {}) => {
		addControl('geolocate', position, new GeolocateControl(config));
	};

	const addAttribution = ({ position = 'bottom-right', ...config } = {}) => {
		addControl('attribution', position, new AttributionControl(config));
	};

	const addFullscreen = ({ position = 'top-right', ...config } = {}) => {
		addControl('fullscreen', position, new FullscreenControl(config));
	};

	const addStyles = ({ position = 'top-right', ...config } = {}) => {
		addControl('styles', position, new StylesControl(config));
	};

	const addTerrain = ({ position = 'top-right', ...config } = {}) => {
		addControl('terrain', position, new TerrainControl(config));
	};

	const removeNavigation = () => removeControl('navigation');
	const removeScale = () => removeControl('scale');
	const removeGeolocate = () => removeControl('geolocate');
	const removeAttribution = () => removeControl('attribution');
	const removeFullscreen = () => removeControl('fullscreen');
	const removeStyles = () => removeControl('styles');
	const removeTerrain = () => removeControl('terrain');

	return {
		addControl,
		removeControl,
		addNavigation,
		addScale,
		addGeolocate,
		addAttribution,
		addFullscreen,
		addStyles,
		addTerrain,
		removeNavigation,
		removeScale,
		removeGeolocate,
		removeAttribution,
		removeFullscreen,
		removeStyles,
		removeTerrain,
	};
};
