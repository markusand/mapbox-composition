const SKY = {
	'sky-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0, 8, 1],
	'sky-type': 'atmosphere',
	'sky-atmosphere-sun-intensity': 5,
};

export default function useTerrain(map, options = {}) {
	const { sky = SKY, ...rest } = options;

	map.addSource('mapboxgl-dem', {
		type: 'raster-dem',
		url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
		tileSize: 512,
		...rest,
	});

	const extrude = ({ exaggeration = 1.5, pitch = 45 }) => {
		map.setTerrain({ source: 'mapboxgl-dem', exaggeration });
		map.easeTo({ pitch });
		if (sky && !map.getLayer('mapboxgl-sky')) {
			map.addLayer({ id: 'mapboxgl-sky', type: 'sky', paint: sky });
		}
	};

	const flatten = () => {
		map.setTerrain();
		map.easeTo({ pitch: 0 });
		if (map.getLayer('mapboxgl-sky')) map.removeLayer('mapboxgl-sky');
	};

	const isExtruded = () => !!map.getTerrain();

	return { extrude, flatten, isExtruded };
}
