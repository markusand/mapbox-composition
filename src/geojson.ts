import type { Map, GeoJSONSourceRaw, GeoJSONSource } from 'mapbox-gl';

import type { GeoJSONLayerOptions } from './types';
import useLayer from './layer';

export default (map: Map, options: GeoJSONLayerOptions) => {
  // Adapt to GeoJSON source format
  const geoJSON = useLayer(map, {
    ...options,
    type: 'geojson',
    source: { data: options.source } as GeoJSONSourceRaw,
  });

  // Override. GeoJSON can be updated by setting new data
  const updateSource = (data: GeoJSONLayerOptions['source']) => {
    const source = map.getSource(options.name) as GeoJSONSource;
    if (source) source.setData(data);
    else geoJSON.updateSource({ data } as GeoJSONSourceRaw);
  };

  return { ...geoJSON, updateSource };
};
