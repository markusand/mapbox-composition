import { Map, NavigationControl, ScaleControl, GeolocateControl, AttributionControl, FullscreenControl, Marker, Popup } from 'mapbox-gl';

async function useMap(container, options = {}) {
	const map = new Map({ container, ...options });
	await map.once('load');
	return map;
}

const SKY = {
	'sky-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0, 8, 1],
	'sky-type': 'atmosphere',
	'sky-atmosphere-sun-intensity': 5,
};

function useTerrain(map, options = {}) {
	const { sky = SKY, ...rest } = options;

	map.addSource('mapboxgl-dem', {
		type: 'raster-dem',
		url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
		tileSize: 512,
		...rest,
	});

	const extrude = (exaggeration = 1.5) => {
		map.setTerrain({ source: 'mapboxgl-dem', exaggeration });
		if (sky && !map.getLayer('mapboxgl-sky')) {
			map.addLayer({ id: 'mapboxgl-sky', type: 'sky', paint: sky });
		}
	};

	const flatten = () => {
		map.setTerrain();
		if (map.getLayer('mapboxgl-sky')) map.removeLayer('mapboxgl-sky');
	};

	const isExtruded = () => !!map.getTerrain();

	return { extrude, flatten, isExtruded };
}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".mapboxgl-ctrl-terrain::before {\n  content: '3D';\n  color: inherit;\n  font-size: 0.85rem;\n  font-weight: bold;\n  display: block;\n}\n\n.mapboxgl-ctrl-terrain-3d::before {\n  content: '2D';\n  color: inherit;\n  font-size: 0.85rem;\n  font-weight: bold;\n  display: block;\n}\n";
styleInject(css_248z);

class TerrainControl {
	constructor(options = {}) {
		this._options = options;
	}

	onAdd(map) {
		const { extrudeOnInit = false, exaggeration, ...options } = this._options;
		const terrain = useTerrain(map, options);

		this._container = document.createElement('div');
		this._container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group');

		const button = document.createElement('button');
		button.classList.add('mapboxgl-ctrl-terrain');
		this._container.appendChild(button);

		const extrude = doExtrude => {
			if (doExtrude) terrain.extrude(exaggeration);
			else terrain.flatten();
			button.classList.toggle('mapboxgl-ctrl-terrain-3d', doExtrude);
		};

		button.addEventListener('click', () => extrude(!terrain.isExtruded()));

		// Reload terrain extrusion state on map style change
		map.on('style.load', () => extrude(terrain.isExtruded()));

		extrude(extrudeOnInit);

		return this._container;
	}

	onRemove() {
		this._container.parentNode.removeChild(this._container);
	}
}

var index = map => {
	const CONTROLS = {};

	const addControl = (name, position, control) => {
		CONTROLS[name] = control;
		map.addControl(control, position);
	};

	const removeControl = name => {
		if (CONTROLS[name]) {
			map.removeControl(CONTROLS[name]);
			delete CONTROLS[name];
		}
	};

	const addNavigation = ({ position = 'top-right', ...config } = {}) => {
		addControl('navigation', position, new NavigationControl(config));
	};

	const addScale = ({ position = 'bottom-left', ...config } = {}) => {
		addControl('scale', position, new ScaleControl(config));
	};

	const addGeolocate = ({ position = 'top-right', ...config } = {}) => {
		addControl('geolocate', position, new GeolocateControl(config));
	};

	const addAttribution = ({ position = 'bottom-right', ...config } = {}) => {
		addControl('attribution', position, new AttributionControl(config));
	};

	const addFullscreen = ({ position = 'top-right', ...config } = {}) => {
		addControl('fullscreen', position, new FullscreenControl(config));
	};

	const addTerrain = ({ position = 'top-right', ...config } = {}) => {
		addControl('terrain', position, new TerrainControl(config));
	};

	const removeNavigation = () => removeControl('navigation');
	const removeScale = () => removeControl('scale');
	const removeGeolocate = () => removeControl('geolocate');
	const removeAttribution = () => removeControl('attribution');
	const removeFullscreen = () => removeControl('fullscreen');
	const removeTerrain = () => removeControl('terrain');

	return {
		addControl,
		removeControl,
		addNavigation,
		addScale,
		addGeolocate,
		addAttribution,
		addFullscreen,
		addTerrain,
		removeNavigation,
		removeScale,
		removeGeolocate,
		removeAttribution,
		removeFullscreen,
		removeTerrain,
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

export { index as useControls, useGeoJSON, useLayer, useMap, useMarker, usePopup, useTerrain };
//# sourceMappingURL=index.esm.js.map
