import { useSourceEvents, useLayerEvents } from './events';
import { isObject } from './utils';

export default (map, options = {}) => {
	const { bindSourceEvents, unbindSourceEvents } = useSourceEvents(map, options.name, options);
	const { bindLayerEvents, unbindLayerEvents } = useLayerEvents(map, options);
	const LAYERS = {};

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

	/* eslint-disable-next-line no-use-before-define */ /* Trust in function hoisting */
	const persistLayerHandler = () => addLayers(Object.values(LAYERS));

	const clearLayers = (layers = Object.keys(LAYERS)) => {
		layers.forEach(id => {
			unbindLayerEvents(id);
			if (map.getLayer(id)) map.removeLayer(id);
			if (id in LAYERS) delete LAYERS[id];
		});
		map.off('style.load', persistLayerHandler);
	};

	const updateLayers = (layers = []) => {
		layers.forEach(layer => {
			const { name, visibility, filter, under, paint = {}, layout = {} } = layer;
			if (visibility !== undefined) setVisibility(visibility, [name]);
			if (filter !== undefined) setFilters(filter, [name]);
			if (under && map.getLayer(under)) map.moveLayer(name, under);
			Object.entries(paint).forEach(([prop, val]) => map.setPaintProperty(name, prop, val));
			Object.entries(layout).forEach(([prop, val]) => map.setLayoutProperty(name, prop, val));
			LAYERS[name] = { ...LAYERS[name], ...layer };
		});
	};

	const addLayers = (layers = []) => {
		const { name: sourceName, persist = true, under: globalUnder } = options;
		layers.forEach(({ name, under = globalUnder, visible = true, ...params }, i) => {
			const id = name || `${sourceName}--${i}`;
			LAYERS[id] = { name, under, visible, ...params };
			const zPosition = map.getLayer(under) ? under : undefined;
			map.addLayer({ id, source: sourceName, ...params }, zPosition);
			setVisibility(visible, [id]);
			bindLayerEvents(id);
		});
		if (persist) map.once('style.load', persistLayerHandler);
	};

	const hasLayer = id => !!LAYERS[id] && !!map.getLayer(id);

	// Source handler is overriden every time to maintain the last available source
	let persistSourceHandler;

	const clearSource = () => {
		const { name } = options;
		clearLayers();
		unbindSourceEvents();
		if (map.getSource(name)) map.removeSource(name);
		map.off('style.load', persistSourceHandler);
	};

	const setSource = source => {
		const { name, type, persist = true } = options;
		const key = type === 'geojson' ? 'data' : 'url';
		const content = isObject(source) ? source : { [key]: source };
		map.addSource(name, { type, ...content });
		bindSourceEvents();
		if (persist) {
			persistSourceHandler = () => setSource(source);
			map.once('style.load', persistSourceHandler);
		}
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
		updateLayers,
		addLayers,
		hasLayer,
		clearSource,
		setSource,
		updateSource,
		isVisible,
		setVisibility,
		setFilters,
	};
};
