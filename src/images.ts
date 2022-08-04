import type { Map } from 'mapbox-gl';

type ImageOptions = { pixelRatio?: number; sdf?: boolean };

export default (map: Map) => {
  let persistImages: Record<string, string> = {};
  let persistListener: ((ev: unknown) => void);

  const loadImage = ([name, path]: string[], options?: ImageOptions): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (map.hasImage(name)) return resolve();
      return map.loadImage(path, (error, image) => {
        if (error) return reject(error);
        if (image) map.addImage(name, image, options);
        return resolve();
      });
    });
  };

  const addImages = async (
    images: Record<string, string>,
    options?: {
      persist?: boolean;
      pixelRatio?: number;
      sdf?: boolean;
    },
  ): Promise<void> => {
    const { persist = true, ...rest } = options || {};
    if (persist) {
      persistImages = { ...persistImages, ...images };
      if (!persistListener) {
        persistListener = () => Object.entries(persistImages).map(image => loadImage(image, rest));
        map.on('style.load', persistListener);
      }
    }
    const loaded = Object.entries(images).map(image => loadImage(image, rest));
    await Promise.all(loaded);
  };

  const removeImages = (images: string | string[]): void => {
    const names = Array.isArray(images) ? images : Object.keys(images);
    names.forEach(name => {
      if (map.hasImage(name)) map.removeImage(name);
      delete persistImages[name];
    });
    if (!Object.keys(persistImages).length) map.off('style.load', persistListener);
  };

  return { addImages, removeImages };
};
