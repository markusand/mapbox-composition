import type { Map, VideoSource } from 'mapbox-gl';
import { useDataset, type DatasetOptions } from './dataset';
import { type Prettify, type MaybePromise } from './utils';

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
  source?: MaybePromise<VideoData>;
  authToken?: string;
} & Omit<DatasetOptions, 'source'>>;

export const useVideo = (map: Map, options: VideoLayerOptions) => {
  const { source, authToken, ...datasetOptions } = options;

  const dataset = useDataset(map, datasetOptions);

  const setSource = async (input: MaybePromise<VideoData>) => {
    const { urls, corners: coordinates } = await input;
    if (authToken) dataset.auth.set(urls, authToken);
    await dataset.setSource({ type: 'video', urls, coordinates });
  };

  if (source) setSource(source);

  const updateSource = async (video: MaybePromise<Omit<VideoData, 'urls'>>) => {
    const data = await video;
    const _source = map.getSource(options.id) as UpdatedVideoSource;
    if (!_source) return;
    _source.setCoordinates(data.corners);
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

export type VideoLayer = ReturnType<typeof useVideo>;
