import type {
	MapboxOptions,
	MapEventType,
} from 'mapbox-gl';

declare module 'mapbox-composition';

export type MapEventHandlers = Record<
	`on${Capitalize<keyof MapEventType>}`,
	(event: MapEventType & EventData) => void
>;

export type MapOptions = Omit<MapboxOptions, 'container'>
	& Partial<MapEventHandlers>
	& { debounceTime?: number };

