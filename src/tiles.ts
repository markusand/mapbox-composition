import type { Map, VectorSourceImpl, PromoteIdSpecification } from 'mapbox-gl';
import { useDataset, type DatasetOptions } from './dataset';
import type { TileJSON } from './tilejson';
import { extract, type Prettify, type MaybePromise } from './utils';

export type TilesLayerOptions = Prettify<{
  type: 'vector' | 'raster';
  source?: MaybePromise<string | string[] | TileJSON>;
  promoteId?: PromoteIdSpecification;
  tileSize?: number;
  volatile?: boolean;
  authToken?: string;
} & Omit<DatasetOptions, 'source'>>;

const ATTRIBUTES = ['type', 'source', 'promoteId', 'volatile', 'authToken'] as const;

export const useTiles = (map: Map, options: TilesLayerOptions) => {
  const [{ source, authToken, ...sourceOptions }, datasetOptions] = extract(options, ATTRIBUTES);

  const { updateSourceCache, ...dataset } = useDataset(map, datasetOptions);

  const setSource = async (input: MaybePromise<string | string[] | TileJSON>) => {
    const tiles = await input;
    const data = typeof tiles === 'string' ? { url: tiles } : Array.isArray(tiles) ? { tiles } : { tiles: tiles.tiles };
    if (authToken) dataset.auth.set(Object.values(data), authToken);
    await dataset.setSource({ ...sourceOptions, ...data });
  };

  if (source) setSource(source);

  const updateSource = async (tiles: MaybePromise<string | string[] | TileJSON>) => {
    const data = await tiles;
    const _source = map.getSource(options.id) as VectorSourceImpl;
    if (!_source) return;
    if (typeof data === 'string') {
      _source.setUrl(data);
      updateSourceCache({ url: data });
      dataset.auth.updateURLs([data]);
    } else if (Array.isArray(data)) {
      _source.setTiles(data);
      updateSourceCache({ tiles: data });
      dataset.auth.updateURLs(data);
    } else {
      _source.setTiles(data.tiles);
      updateSourceCache({ tiles: data.tiles });
      dataset.auth.updateURLs(data.tiles);
    }
  };

  const clearSource = () => {
    dataset.clearSource();
    dataset.auth.clear();
  };

  return { ...dataset, setSource, updateSource, clearSource };
};

export type TilesLayer = ReturnType<typeof useTiles>;
