import type { Map, ImageSource } from 'mapbox-gl';
import { useDataset, type DatasetOptions } from './dataset';
import { type Prettify } from './utils';

export type ImageData = {
  url: string;
  corners: [number, number][];
};

export type ImageLayerOptions = Prettify<{
  source?: ImageData;
  authToken?: string;
} & Omit<DatasetOptions, 'source'>>;

export const useImage = (map: Map, options: ImageLayerOptions) => {
  const { source, authToken, ...datasetOptions } = options;

  const dataset = useDataset(map, datasetOptions);

  const setSource = ({ url, corners: coordinates }: ImageData) => {
    if (authToken) dataset.auth.set([url], authToken);
    dataset.setSource({ type: 'image', url, coordinates });
  };

  if (source) setSource(source);

  const updateSource = ({ url, corners: coordinates }: Partial<ImageData>) => {
    const _source = map.getSource(options.id) as ImageSource;
    if (!_source) return;
    if (url) {
      _source.updateImage({ url, coordinates });
      if (authToken) dataset.auth.updateURLs([url]);
    } else if (coordinates) {
      _source.setCoordinates(coordinates);
    }
  };

  const clearSource = () => {
    dataset.clearSource();
    dataset.auth.clear();
  };

  return { ...dataset, setSource, updateSource, clearSource };
};
