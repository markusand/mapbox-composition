import { Map, NavigationControl, ScaleControl, GeolocateControl, AttributionControl, FullscreenControl, Marker, Popup } from 'mapbox-gl';

async function useMap(container, options = {}) {
	const map = new Map({ container, ...options });
	await map.once('load');
	return map;
}

var index = map => {
	const CONTROLS = {};

	const addControl = (name, control, position = 'top-right') => {
		CONTROLS[name] = control;
		map.addControl(control, position);
	};

	const removeControl = name => {
		if (CONTROLS[name]) {
			map.removeControl(CONTROLS[name]);
			delete CONTROLS[name];
		}
	};

	const addNavigation = (config, position) => {
		addControl('navigation', new NavigationControl(config), position);
	};

	const addScale = (config, position) => {
		addControl('scale', new ScaleControl(config), position);
	};

	const addGeolocate = (config, position) => {
		addControl('geolocate', new GeolocateControl(config), position);
	};

	const addAttribution = (config, position) => {
		addControl('attribution', new AttributionControl(config), position);
	};

	const addFullscreen = (config, position) => {
		addControl('fullscreen', new FullscreenControl(config), position);
	};

	const removeNavigation = () => removeControl('navigation');
	const removeScale = () => removeControl('scale');
	const removeGeolocate = () => removeControl('geolocate');
	const removeAttribution = () => removeControl('attribution');
	const removeFullscreen = () => removeControl('fullscreen');

	return {
		addControl,
		removeControl,
		addNavigation,
		addScale,
		addGeolocate,
		addAttribution,
		addFullscreen,
		removeNavigation,
		removeScale,
		removeGeolocate,
		removeAttribution,
		removeFullscreen,
	};
};

var useSourceEvents = (map, sourceId, { onError, onLoadStart, onLoadEnd }) => {
	let isSourceLoading = false;

	const sourceLoadStartHandler = event => {
		const { sourceDataType = 'content' } = event; // Little hack here
		if (event.sourceId === sourceId && !isSourceLoading && sourceDataType === 'content') {
			if (onLoadStart) onLoadStart(event);
			isSourceLoading = true;
		}
	};

	const sourceLoadEndHandler = event => {
		if (event.sourceId === sourceId && isSourceLoading && map.isSourceLoaded(sourceId)) {
			if (onLoadEnd) onLoadEnd(event);
			isSourceLoading = false;
		}
	};

	const sourceErrorHandler = event => {
		if (event.sourceId === sourceId) onError(event.error);
	};

	const bindSourceEvents = () => {
		if (onLoadStart || onLoadEnd) map.on('sourcedataloading', sourceLoadStartHandler);
		if (onLoadEnd) map.on('sourcedata', sourceLoadEndHandler);
		if (onError) map.on('error', sourceErrorHandler);
	};

	const unbindSourceEvents = () => {
		map.off('sourcedataloading', sourceLoadStartHandler);
		map.off('sourcedata', sourceLoadEndHandler);
		map.off('error', sourceErrorHandler);
	};

	return { bindSourceEvents, unbindSourceEvents };
};

var useLayerEvents = (map, { onClick, onHover }) => {
	const layerClickHandler = event => onClick(event);
	const layerHoverHandler = event => onHover(event);

	const bindLayerEvents = layerId => {
		if (onClick) map.on('click', layerId, layerClickHandler);
		if (onHover) {
			map.on('mouseenter', layerId, layerHoverHandler);
			map.on('mousemove', layerId, layerHoverHandler);
			map.on('mouseleave', layerId, layerHoverHandler);
		}
	};

	const unbindLayerEvents = layerId => {
		map.off('click', layerId, layerClickHandler);
		map.off('mouseenter', layerId, layerHoverHandler);
		map.off('mousemove', layerId, layerHoverHandler);
		map.off('mouseleave', layerId, layerHoverHandler);
	};

	return { bindLayerEvents, unbindLayerEvents };
};

var useMarkerEvents = ({ onDragStart, onDrag, onDragEnd }) => {
	const bindMarkerEvents = marker => {
		if (onDragStart) marker.on('dragstart', onDragStart);
		if (onDrag) marker.on('drag', onDrag);
		if (onDragEnd) marker.on('dragend', onDragEnd);
	};

	const unbindMarkerEvents = marker => {
		marker.on('dragstart', onDragStart);
		marker.on('drag', onDrag);
		marker.on('dragend', onDragEnd);
	};

	return { bindMarkerEvents, unbindMarkerEvents };
};

var usePopupEvents = ({ onOpen, onClose }) => {
	const bindPopupEvents = popup => {
		if (onOpen) popup.on('open', onOpen);
		if (onClose) popup.on('close', onClose);
	};

	const unbindPopupEvents = popup => {
		popup.off('open', onOpen);
		popup.off('close', onClose);
	};

	return { bindPopupEvents, unbindPopupEvents };
};

const isObject = item => !!item && item.constructor === Object;

function useLayer(map, options = {}) {
	const { bindSourceEvents, unbindSourceEvents } = useSourceEvents(map, options.name, options);
	const { bindLayerEvents, unbindLayerEvents } = useLayerEvents(map, options);
	const LAYERS = [];

	const isVisible = id => map.getLayoutProperty(id, 'visibility') === 'visible';

	const setVisibility = (visible, layers = Object.keys(LAYERS)) => {
		const visibility = visible ? 'visible' : 'none';
		layers.forEach(id => map.setLayoutProperty(id, 'visibility', visibility));
	};

	const setFilters = (filters = [], layers = Object.keys(LAYERS)) => {
		layers.forEach(id => {
			const filter = Array.isArray(filters)
				? filters.length
					? ['all', ...filters]
					: LAYERS[id].filter
				: null;
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

function useGeoJSON(map, options = {}) {
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
}

function useMarker(map, options = {}) {
	const { coordinates, popup, ...rest } = options;
	const { bindMarkerEvents } = useMarkerEvents(options);

	const marker = new Marker({ ...rest });
	let markerPopup;

	const setLocation = coords => marker.setLngLat(coords).addTo(map);
	const setPopup = newPopup => {
		markerPopup = newPopup;
		marker.setPopup(newPopup.popup);
	};

	// Instantiate
	if (popup) setPopup(popup);
	setLocation(coordinates);
	bindMarkerEvents(marker);

	return {
		setLocation,
		get marker() { return marker; },
		get popup() { return markerPopup; },
		set popup(newPopup) { setPopup(newPopup); },
	};
}

const uuid = () => Math.random().toString(36).substring(7);

function usePopup(...args) {
	const [map, options = {}] = args.length === 1 ? [, args[0]] : args;
	const { content, coordinates, name = `popup-${uuid()}`, ...rest } = options;
	const { bindPopupEvents } = usePopupEvents(options);

	const popup = new Popup(rest);

	const setLocation = coords => popup.setLngLat(coords).addTo(map);
	const setContent = newContent => popup.setHTML(newContent);

	// Instantiate
	if (coordinates) setLocation(coordinates);
	setContent(content || `<div id="${name}"></div>`);
	bindPopupEvents(popup);

	return {
		get popup() { return popup; },
		name,
		setLocation,
		setContent,
	};
}

export { index as useControls, useGeoJSON, useLayer, useMap, useMarker, usePopup };
//# sourceMappingURL=index.esm.js.map
