import type {
	MapboxOptions,
	MapEventType,
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

export type TerrainOptions = Partial<{
	sky: SkyPaint;
	fog: Fog;
}> & RasterDemSource;

export type TerrainExtrusion = TerrainSpecification & { pitch: number };
