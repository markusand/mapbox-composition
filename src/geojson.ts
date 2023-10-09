import type { Map, GeoJSONSource, GeoJSONSourceOptions, Expression } from 'mapbox-gl';
import { useDataset, type DatasetOptions } from './dataset';
import { capitalize, extract, type Prettify, type MaybePromise } from './utils';

type ClusterOptions = {
  maxZoom?: number;
  minPoints?: number;
  properties?: Record<string, Expression>;
  radius?: number;
};

// Fix @types/mapbox-gl type including String instead of string 🤷🏻‍♂️
export type GeoJSONData = string | Exclude<Parameters<GeoJSONSource['setData']>[0], String>;

type SourceOptions = {
  source?: MaybePromise<GeoJSONData>;
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

  const { updateSourceCache, ...dataset } = useDataset(map, datasetOptions);

  const setSource = async (geojson: MaybePromise<GeoJSONData>) => {
    const data = await geojson;
    if (authToken && typeof data === 'string') dataset.auth.set([data], authToken);
    await dataset.setSource({
      ...sourceOptions,
      ...clusterOptions,
      type: 'geojson',
      data,
    });
  };

  if (source) setSource(source);

  const updateSource = async (geojson: MaybePromise<GeoJSONData>) => {
    const data = await geojson;
    const _source = map.getSource(options.id) as GeoJSONSource;
    if (_source) {
      _source.setData(data);
      updateSourceCache({ data });
    }
    if (typeof data === 'string') dataset.auth.updateURLs([data]);
  };

  const clearSource = () => {
    dataset.clearSource();
    dataset.auth.clear();
  };

  return { ...dataset, setSource, updateSource, clearSource };
};

export type GeoJSONLayer = ReturnType<typeof useGeoJSON>;
