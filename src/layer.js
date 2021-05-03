import { useSourceEvents, useLayerEvents } from './events';

const isObject = item => !!item && item.constructor === Object;

export default function useLayer(map, options = {}) {
	const { bindSourceEvents, unbindSourceEvents } = useSourceEvents(map, options.name, options);
	const { bindLayerEvents, unbindLayerEvents } = useLayerEvents(map, options);
	const LAYERS = [];

	const isVisible = id => map.getLayoutProperty(id, 'visibility') === 'visible';

	const setVisibility = (visible, layers = Object.keys(LAYERS)) => {
		const visibility = visible ? 'visible' : 'none';
		layers.forEach(id => map.setLayoutProperty(id, 'visibility', visibility));
	};

	const setFilters = (filters = [], layers = Object.keys(LAYERS)) => {
		const all = isObject(filters) ? ['all', ...Object.values(filters).filter(Boolean)] : filters;
		layers.forEach(id => {
			const filter = all && all.length ? all : LAYERS[id].filter;
			map.setFilter(id, filter);
		});
	};

	const clearLayers = (layers = Object.keys(LAYERS)) => {
		layers.forEach(id => {
			unbindLayerEvents(id);
			if (map.getLayer(id)) map.removeLayer(id);
			if (id in LAYERS) delete LAYERS[id];
		});
	};

	const addLayers = (layers = []) => {
		layers.forEach(({ name, ...params }, i) => {
			const id = name || `${options.name}--${i}`;
			LAYERS[id] = params;
			map.addLayer({ id, source: options.name, ...params });
			bindLayerEvents(id);
		});
	};

	const clearSource = () => {
		clearLayers();
		unbindSourceEvents();
		if (map.getSource(options.name)) map.removeSource(options.name);
	};

	const setSource = source => {
		const key = options.type === 'geojson' ? 'data' : 'url';
		const content = isObject(source) ? source : { [key]: source };
		map.addSource(options.name, { type: options.type, ...content });
		bindSourceEvents();
	};

	const updateSource = (source, layers = options.layers) => {
		clearSource();
		setSource(source);
		addLayers(layers);
	};

	setSource(options.source);
	addLayers(options.layers);

	return {
		clearLayers,
		addLayers,
		clearSource,
		setSource,
		updateSource,
		isVisible,
		setVisibility,
		setFilters,
	};
}
