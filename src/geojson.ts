import type { Map, GeoJSONSourceRaw, GeoJSONSource, GeoJSONSourceOptions } from 'mapbox-gl';
import type { Feature, Geometry, FeatureCollection } from 'geojson';
import useLayer, { BaseLayerOptions } from './layer';

export type GeoJSONLayerOptions = {
  source: GeoJSONSourceOptions | Feature<Geometry> | FeatureCollection<Geometry> | string,
} & Omit<BaseLayerOptions, 'type' | 'source'>;

const isString = (item: any): item is string => typeof item === 'string';
const isGeo = (item: any): item is Feature<Geometry> | FeatureCollection<Geometry> => (
  'type' in item && (item.type === 'Feature' || item.type === 'FeatureCollection')
);

const getSource = (source: any) => isString(source) || isGeo(source) ? { data: source } : source;

export default (map: Map, options: GeoJSONLayerOptions) => {
  const layer = useLayer(map, {
    ...options,
    type: 'geojson',
    source: getSource(options.source),
  });

  // Override. GeoJSON can be updated by setting new data
  const updateSource = (data: Feature<Geometry> | FeatureCollection<Geometry> | string) => {
    const source = map.getSource(options.name) as GeoJSONSource;
    if (source) source.setData(data);
    else layer.updateSource({ data } as GeoJSONSourceRaw);
  };

  return { ...layer, updateSource };
};
