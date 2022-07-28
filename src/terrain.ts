const TERRAIN = {
	type: 'raster-dem',
	url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
	tileSize: 512,
};

const SKY = {
	'sky-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0, 8, 1],
	'sky-type': 'atmosphere',
	'sky-atmosphere-sun-intensity': 5,
};

const FOG = {
	range: [1.0, 12.0],
	color: '#ffffff',
	'horizon-blend': 0.1,
};

export default (map, options = {}) => {
	const { sky = SKY, fog = FOG, ...rest } = options;

	const extrude = ({ exaggeration = 1.5, pitch = 45 }) => {
		map.addSource('mapboxgl-dem', { ...TERRAIN, ...rest });
		map.setTerrain({ source: 'mapboxgl-dem', exaggeration });
		map.easeTo({ pitch });
		map.setFog(fog);
		if (sky && !map.getLayer('mapboxgl-sky')) {
			map.addLayer({ id: 'mapboxgl-sky', type: 'sky', paint: sky });
		}
	};

	const flatten = () => {
		map.setTerrain();
		map.setFog();
		map.easeTo({ pitch: 0 });
		if (map.getSource('mapboxgl-dem')) map.removeSource('mapboxgl-dem');
		if (map.getLayer('mapboxgl-sky')) map.removeLayer('mapboxgl-sky');
	};

	const isExtruded = () => !!map.getTerrain();

	return { extrude, flatten, isExtruded };
};
