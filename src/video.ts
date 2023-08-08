import type { Map, VideoSource } from 'mapbox-gl';
import { useDataset, type DatasetOptions } from './dataset';
import { type Prettify } from './utils';

// @types/mapbox-gl has outdated type for VideoSource
type UpdatedVideoSource = {
  play: () => undefined;
  pause: () => undefined;
} & VideoSource;

export type VideoData = {
  urls: string[];
  corners: [number, number][];
};

export type VideoLayerOptions = Prettify<{
  source?: VideoData;
  authToken?: string;
} & Omit<DatasetOptions, 'source'>>;

export const useVideo = (map: Map, options: VideoLayerOptions) => {
  const { source, authToken, ...datasetOptions } = options;

  const dataset = useDataset(map, datasetOptions);

  const setSource = ({ urls, corners: coordinates }: VideoData) => {
    if (authToken) dataset.auth.set(urls, authToken);
    dataset.setSource({ type: 'video', urls, coordinates });
  };

  if (source) setSource(source);

  const updateSource = (corners: [number, number][]) => {
    const _source = map.getSource(options.id) as UpdatedVideoSource;
    if (!_source) return;
    _source.setCoordinates(corners);
  };

  const clearSource = () => {
    dataset.clearSource();
    dataset.auth.clear();
  };

  const play = () => {
    const _source = map.getSource(options.id) as UpdatedVideoSource;
    _source.play();
  };

  const pause = () => {
    const _source = map.getSource(options.id) as UpdatedVideoSource;
    _source.pause();
  };

  return { ...dataset, setSource, updateSource, clearSource, play, pause };
};
