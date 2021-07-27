import { useSourceEvents, useLayerEvents } from './events';

const isObject = item => !!item && item.constructor === Object;

export default function useLayer(map, options = {}) {
	const { bindSourceEvents, unbindSourceEvents } = useSourceEvents(map, options.name, options);
	const { bindLayerEvents, unbindLayerEvents } = useLayerEvents(map, options);
	const LAYERS = [];

	const isVisible = id => map.getLayoutProperty(id, 'visibility') === 'visible';

	const setVisibility = (visible, layers = Object.keys(LAYERS)) => {
		const visibility = visible ? 'visible' : 'none';
		layers.forEach(id => {
			LAYERS[id].visible = visible;
			map.setLayoutProperty(id, 'visibility', visibility);
		});
	};

	const setFilters = (filters = [], layers = Object.keys(LAYERS)) => {
		const all = isObject(filters) ? ['all', ...Object.values(filters).filter(Boolean)] : filters;
		layers.forEach(id => {
			LAYERS[id].filter = all && all.length ? all : LAYERS[id].filter;
			map.setFilter(id, LAYERS[id].filter);
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
		const { name: sourceName, persist = true } = options;
		layers.forEach(({ name, visible = true, ...params }, i) => {
			const id = name || `${sourceName}--${i}`;
			LAYERS[id] = { name, ...params };
			map.addLayer({ id, source: sourceName, ...params });
			setVisibility(visible, [id]);
			bindLayerEvents(id);
		});
		if (persist) map.once('style.load', () => addLayers(Object.values(LAYERS)));
	};

	const clearSource = () => {
		const { name } = options;
		clearLayers();
		unbindSourceEvents();
		if (map.getSource(name)) map.removeSource(name);
	};

	const setSource = source => {
		const { name, type, persist = true } = options;
		const key = type === 'geojson' ? 'data' : 'url';
		const content = isObject(source) ? source : { [key]: source };
		map.addSource(name, { type, ...content });
		bindSourceEvents();
		if (persist) map.once('style.load', () => setSource(source));
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
