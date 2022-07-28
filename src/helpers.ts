import { LngLatBounds } from 'mapbox-gl';
import { toArray } from './utils';

const bbox = geojson => {
	const features = geojson.features || toArray(geojson);
	return features.reduce((acc, { geometry }) => {
		geometry.coordinates.forEach(coords => acc.extend(coords));
		return acc;
	}, new LngLatBounds());
};

export default { bbox };
