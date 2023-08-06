import type { Map, GeoJSONSource, GeoJSONSourceOptions, Expression } from 'mapbox-gl';
import { useDataset, type DatasetOptions } from './dataset';
import { capitalize, extract, type Prettify } from './utils';

type ClusterOptions = {
  maxZoom?: number;
  minPoints?: number;
  properties?: Record<string, Expression>;
  radius?: number;
};

export type GeoJSONData = GeoJSONSourceOptions['data'];

type SourceOptions = {
  source: GeoJSONData;
  cluster?: ClusterOptions;
} & Omit<GeoJSONSourceOptions, 'data' | 'cluster' | `cluster${Capitalize<keyof ClusterOptions>}`>;

export type GeoJSONLayerOptions = Prettify<Omit<DatasetOptions, 'source'> & SourceOptions>;

const ATTRIBUTES = ['attribution', 'buffer', 'source', 'generateId', 'promoteId', 'filter', 'lineMetrics', 'maxzoom', 'tolerance', 'cluster'] as const;

export const useGeoJSON = (map: Map, options: GeoJSONLayerOptions) => {
  const [
    { source: data, cluster, ...sourceOptions },
    datasetOptions,
  ] = extract(options, ATTRIBUTES);

  const clusterOptions = cluster
    ? {
      cluster: true,
      ...Object.fromEntries(
        Object.entries(cluster)
          .map(([attr, value]) => [`cluster${capitalize(attr)}`, value]),
      ),
    } : {};

  const dataset = useDataset(map, {
    ...datasetOptions,
    source: {
      ...sourceOptions,
      ...clusterOptions,
      type: 'geojson',
      data,
    },
  });

  const updateSource = (update: Parameters<GeoJSONSource['setData']>[0]) => {
    const source = map.getSource(options.id) as GeoJSONSource;
    if (source) source.setData(update);
  };

  return { ...dataset, updateSource };
};
