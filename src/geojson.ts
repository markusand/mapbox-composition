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
  source?: GeoJSONData;
  cluster?: ClusterOptions;
  authToken?: string;
} & Omit<GeoJSONSourceOptions, 'data' | 'cluster' | `cluster${Capitalize<keyof ClusterOptions>}`>;

export type GeoJSONLayerOptions = Prettify<Omit<DatasetOptions, 'source'> & SourceOptions>;

const ATTRIBUTES = ['authToken', 'attribution', 'buffer', 'source', 'generateId', 'promoteId', 'filter', 'lineMetrics', 'maxzoom', 'tolerance', 'cluster'] as const;

const clusterize = (cluster: ClusterOptions) => Object.fromEntries(
  Object.entries(cluster).map(([attr, value]) => [`cluster${capitalize(attr)}`, value]),
);

export const useGeoJSON = (map: Map, options: GeoJSONLayerOptions) => {
  const [
    { source, cluster, authToken, ...sourceOptions },
    datasetOptions,
  ] = extract(options, ATTRIBUTES);

  const clusterOptions = cluster ? { cluster: true, ...clusterize(cluster) } : {};

  const dataset = useDataset(map, datasetOptions);

  const setSource = (geojson: GeoJSONData) => {
    if (authToken && typeof geojson === 'string') dataset.auth.set([geojson], authToken);
    dataset.setSource({
      ...sourceOptions,
      ...clusterOptions,
      type: 'geojson',
      data: geojson,
    });
  };

  if (source) setSource(source);

  const updateSource = (geojson: Parameters<GeoJSONSource['setData']>[0]) => {
    const _source = map.getSource(options.id) as GeoJSONSource;
    if (_source) _source.setData(geojson);
    if (typeof geojson === 'string') dataset.auth.updateURLs([geojson]);
  };

  const clearSource = () => {
    dataset.clearSource();
    dataset.auth.clear();
  };

  return { ...dataset, setSource, updateSource, clearSource };
};

export type GeoJSONLayer = ReturnType<typeof useGeoJSON>;
