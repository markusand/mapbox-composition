import type { Map } from 'mapbox-gl';
import type { TerrainOptions, TerrainExtrusion } from './types';

const defaults: { TERRAIN: TerrainOptions, SKY: TerrainOptions['sky'], FOG: TerrainOptions['fog'] } = {
	TERRAIN: {
		type: 'raster-dem',
		url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
		tileSize: 512,
	},
	SKY: {
		'sky-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0, 8, 1],
		'sky-type': 'atmosphere',
		'sky-atmosphere-sun-intensity': 5,
	},
	FOG: {
		range: [1.0, 12.0],
		color: '#ffffff',
		'horizon-blend': 0.1,
	}
};

export default (map: Map, options: TerrainOptions) => {
	const { sky = defaults.SKY, fog = defaults.FOG, ...terrain } = options;

	const extrude = ({ exaggeration = 1.5, pitch = 45 }: TerrainExtrusion) => {
		map.addSource('mapboxgl-dem', terrain);
		map.setTerrain({ source: 'mapboxgl-dem', exaggeration });
		map.easeTo({ pitch });
		if (fog) map.setFog(fog);
		if (sky && !map.getLayer('mapboxgl-sky')) {
			map.addLayer({ id: 'mapboxgl-sky', type: 'sky', paint: sky });
		}
	};

	const flatten = () => {
		map.setTerrain();
		map.setFog(null!); // setFog accepts null to remove fog
		map.easeTo({ pitch: 0 });
		if (map.getSource('mapboxgl-dem')) map.removeSource('mapboxgl-dem');
		if (map.getLayer('mapboxgl-sky')) map.removeLayer('mapboxgl-sky');
	};

	const isExtruded = () => !!map.getTerrain();

	return { extrude, flatten, isExtruded };
};
