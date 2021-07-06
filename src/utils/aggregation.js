import buffer from '@turf/buffer';
import concave from '@turf/concave';
import bbox from '@turf/bbox';
import collect from '@turf/collect';
import hexGrid from '@turf/hex-grid';
import squareGrid from '@turf/square-grid';
import { featureCollection } from '@turf/helpers';
import * as aggregations from 'stats-fns';

const GRIDS = { hexGrid, squareGrid };

export default function useAggregation(source, options = {}) {
	const { // Defaults
		size = 1,
		units = 'kilometers',
		shape = 'hex',
		property = 'id',
		aggregation = 'count',
		clear = true,
	} = options;

	const mask = buffer(concave(source), size, { units });
	const grid = GRIDS[`${shape}Grid`](bbox(mask), size / 2, { mask, units });
	const bins = collect(grid, source, property, property);
	const features = bins.features
		.filter(feature => !clear || feature.properties[property].length)
		.map(feature => {
			const values = feature.properties[property];
			const aggregated = values
				? typeof aggregation === 'function'
					? aggregation(values, aggregations)
					: aggregations[aggregation](values)
				: null;
			const properties = { ...feature.properties, [property]: aggregated };
			return { ...feature, properties };
		});
	return featureCollection(features);
}
