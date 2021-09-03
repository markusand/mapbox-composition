import useLayer from './layer';

export default (map, options = {}) => {
	// Adapt to GeoJSON source format
	const geoJSON = useLayer(map, {
		...options,
		type: 'geojson',
		source: { data: options.source },
	});

	// Override. GeoJSON can be updated by setting new data
	const updateSource = data => {
		const source = map.getSource(options.name);
		if (source) source.setData(data);
		else geoJSON.updateSource({ data });
	};

	return { ...geoJSON, updateSource };
};
