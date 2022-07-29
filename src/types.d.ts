import type {
	MapboxOptions,
	MapEventType,
	LngLatLike,
	EventedListener,
	Source as MSource,
	AnySourceData,
	GeoJSONSourceRaw,
	Layer as MLayer,
	Popup as MPopup,
	PopupOptions as MPopupOptions,
	Marker as MMarker,
	MarkerOptions as MMarkerOptions,
	SkyPaint,
	TerrainSpecification,
	Fog,
	RasterDemSource,
	GeoJSONSourceRaw
} from 'mapbox-gl';

import type { Feature, Geometry, FeatureCollection } from 'geojson';

declare module 'mapbox-composition';

export type MapEventHandlers = Record<
	`on${Capitalize<keyof MapEventType>}`,
	(event: MapEventType & EventData) => void
>;

export type MapOptions = Omit<MapboxOptions, 'container'>
	& Partial<MapEventHandlers>
	& { debounceTime?: number };


export type LayerOptions = {
	name: string;
	visible?: boolean;
	under?: string;
	filter?: any[];
} & MLayer;

export type Layer = {
	clearLayers: (layerIds?: string[]) => void,
	updateLayers: (layers?: LayerOptions[]) => void,
	addLayers: (layers: LayerOptions[]) => void,
	hasLayer: (id: string) => boolean,
	clearSource: () => void,
	setSource: (source: AnySourceData | string) => void,
	updateSource: (source: AnySourceData | string, layers?: LayerOptions[]) => void,
	isVisible: (LayerId: string) => boolean,
	setVisibility: (isVisible: boolean, layerIds?: string[]) => void,
	setFilters: (filters: any[], layerIds?: string[]) => void,
};

export type BaseLayerOptions = {
	name: string;
	type: MSource['type'];
	source: AnySourceData | string;
	layers: LayerOptions[];
	persist?: boolean;
	under?: string;
	onError?: EventedListener,
	onLoadStart?: EventedListener,
	onLoadEnd?: EventedListener,
	onClick?: EventedListener,
	onHover?: EventedListener,
};

export type GeoJSONLayerOptions = {
	source: Feature<Geometry> | FeatureCollection<Geometry> | string,
} & BaseLayerOptions;

export type Popup = {
	popup: MPopup,
	name: string;
	setLocation: (location: LngLatLike) => void;
	setContent: (content: string) => void;
};

export type PopupOptions = {
	name: string;
	coordinates?: LngLatLike;
	content?: string;
	onOpen?: EventedListener;
	onClose?: EventedListener;
} & MPopupOptions;

export type Marker = {
	marker: MMarker;
	popup: Popup;
	setLocation: (location: LngLatLike) => void;
};

export type MarkerOptions = {
	coordinates: LngLatLike;
	popup?: Popup;
	onDragStart?: EventedListener,
	onDrag?: EventedListener,
	onDragEnd?: EventedListener;
} & MMarkerOptions;

export type TerrainOptions = Partial<{
	sky: SkyPaint;
	fog: Fog;
} & RasterDemSource>;

export type TerrainExtrusion = {
	exaggeration?: number;
	pitch?: number;
};

export type TerrainControlOptions = {
	extrudeOnInit?: boolean,
} & TerrainExtrusion & TerrainOptions;
