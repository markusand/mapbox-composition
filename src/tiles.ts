import type { Map, VectorSourceImpl, PromoteIdSpecification } from 'mapbox-gl';
import { useDataset, type DatasetOptions } from './dataset';
import type { TileJSON } from './tilejson';
import { extract, type Prettify } from './utils';

export type TilesLayerOptions = Prettify<{
  type: 'vector' | 'raster';
  source?: string | string[] | TileJSON;
  promoteId?: PromoteIdSpecification;
  tileSize?: number;
  volatile?: boolean;
} & Omit<DatasetOptions, 'source'>>;

const ATTRIBUTES = ['type', 'source', 'promoteId', 'volatile'] as const;

export const useTiles = (map: Map, options: TilesLayerOptions) => {
  const [{ source, ...sourceOptions }, datasetOptions] = extract(options, ATTRIBUTES);

  const dataset = useDataset(map, datasetOptions);

  const setSource = (tiles: string | string[] | TileJSON) => {
    dataset.setSource({
      ...sourceOptions,
      ...(typeof tiles === 'string' ? { url: tiles } : Array.isArray(tiles) ? { tiles } : tiles),
    });
  };

  if (source) setSource(source);

  const updateSource = (tiles: string | string[]) => {
    const _source = map.getSource(options.id) as VectorSourceImpl;
    if (!_source) return;
    if (typeof tiles === 'string') _source.setUrl(tiles);
    else _source.setTiles(tiles);
  };

  return { ...dataset, setSource, updateSource };
};
