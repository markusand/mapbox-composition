import type { Map, VectorSourceImpl, PromoteIdSpecification } from 'mapbox-gl';
import { useDataset, type DatasetOptions } from './dataset';
import type { TileJSON } from './tilejson';
import { extract, type Prettify } from './utils';

export type TilesLayerOptions = Prettify<{
  type: 'vector' | 'raster';
  source: string | string[] | TileJSON;
  promoteId?: PromoteIdSpecification;
  tileSize?: number;
  volatile?: boolean;
} & Omit<DatasetOptions, 'source'>>;

const ATTRIBUTES = ['type', 'source', 'promoteId', 'volatile'] as const;

export const useTiles = (map: Map, options: TilesLayerOptions) => {
  const [{ source: tiles, ...sourceOptions }, datasetOptions] = extract(options, ATTRIBUTES);

  const dataset = useDataset(map, {
    ...datasetOptions,
    source: {
      ...sourceOptions,
      ...(typeof tiles === 'string' ? { url: tiles } : Array.isArray(tiles) ? { tiles } : tiles),
    },
  });

  const updateSource = (update: string | string[]) => {
    const source = map.getSource(options.id) as VectorSourceImpl;
    if (!source) return;
    if (typeof update === 'string') source.setUrl(update);
    else source.setTiles(update);
  };

  return { ...dataset, updateSource };
};
