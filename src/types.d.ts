import type {
	MapboxOptions,
	MapEventType,
	LngLatLike,
	EventedListener,
	Popup as MPopup,
	PopupOptions as MPopupOptions,
	Marker as MMarker,
	MarkerOptions as MMarkerOptions,
	SkyPaint,
	TerrainSpecification,
	Fog,
	RasterDemSource
} from 'mapbox-gl';

declare module 'mapbox-composition';

export type MapEventHandlers = Record<
	`on${Capitalize<keyof MapEventType>}`,
	(event: MapEventType & EventData) => void
>;

export type MapOptions = Omit<MapboxOptions, 'container'>
	& Partial<MapEventHandlers>
	& { debounceTime?: number };

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
}> & RasterDemSource;

export type TerrainExtrusion = TerrainSpecification & { pitch: number };
