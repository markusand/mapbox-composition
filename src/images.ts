import type { Map } from 'mapbox-gl';

type Image = HTMLImageElement | ImageBitmap;

export type ImageOptions = {
  persist?: boolean,
  pixelRatio?: number;
  sdf?: boolean,
  stretchX?: [number, number][];
  stretchY?: [number, number][];
  content?: [number, number, number, number];
};

const cache: Record<string, { image: Image, options?: ImageOptions }> = {};

export const useImages = (map: Map) => {
  const reloadCache = () => {
    Object.entries(cache).forEach(([name, { image, options }]) => {
      if (!map.hasImage(name)) map.addImage(name, image, options);
    });
  };

  const loadImage = (path: string) => new Promise<Image>((resolve, reject) => {
    map.loadImage(path, (error, image) => {
      if (error || !image) return reject(error);
      resolve(image);
    });
  });

  const addImages = async (paths: Record<string, string>, options?: ImageOptions) => {
    const { persist = true } = options || {};
    const loading = Object.entries(paths).map(async ([name, path]) => {
      const image = await loadImage(path);
      if (!map.hasImage(name)) map.addImage(name, image, options);
      if (persist) cache[name] = { image, options };
    });
    await Promise.all(loading);
  };

  const removeImages = (names: string[]) => {
    names.forEach(name => {
      if (map.hasImage(name)) map.removeImage(name);
      delete cache[name];
    });
  };

  map.on('style.load', reloadCache);

  return { addImages, removeImages };
};
