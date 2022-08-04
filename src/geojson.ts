import type { Map, GeoJSONSourceRaw, GeoJSONSource } from 'mapbox-gl';
import type { Feature, Geometry, FeatureCollection } from 'geojson';
import useLayer, { BaseLayerOptions } from './layer';

export type GeoJSONLayerOptions = {
  source: Feature<Geometry> | FeatureCollection<Geometry> | string,
} & Omit<BaseLayerOptions, 'type' | 'source'>;

export default (map: Map, options: GeoJSONLayerOptions) => {
  // Adapt to GeoJSON source format
  const geojson = { data: options.source };
  const layer = useLayer(map, {
    ...options,
    type: 'geojson',
    source: geojson as GeoJSONSourceRaw,
    // source: { data: options.source } as GeoJSONSourceRaw,
  });

  // Override. GeoJSON can be updated by setting new data
  const updateSource = (data: GeoJSONLayerOptions['source']) => {
    const source = map.getSource(options.name) as GeoJSONSource;
    if (source) source.setData(data);
    else layer.updateSource({ data } as GeoJSONSourceRaw);
    geojson.data = data;
  };

  return { ...layer, updateSource };
};
