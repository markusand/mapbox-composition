import type { Map } from 'mapbox-gl';

export default (map: Map) => {
  let persistImages: Record<string, string> = {};
  let persistListener: ((ev: unknown) => void);

  const loadImage = ([name, path]: string[]): Promise<void> => new Promise((resolve, reject) => {
    if (map.hasImage(name)) return resolve();
    return map.loadImage(path, (error, image) => {
      if (error) return reject(error);
      if (image) map.addImage(name, image);
      return resolve();
    });
  });

  const addImages = async (
    images: Record<string, string>,
    options?: { persist?: boolean },
  ): Promise<void> => {
    const { persist = true } = options || {};
    if (persist) {
      persistImages = { ...persistImages, ...images };
      if (!persistListener) {
        persistListener = () => Object.entries(persistImages).map(loadImage);
        map.on('style.load', persistListener);
      }
    }
    const loaded = Object.entries(images).map(loadImage);
    await Promise.all(loaded);
  };

  const removeImages = (images: string | string[]): void => {
    const names = Array.isArray(images) ? images : Object.keys(images);
    names.forEach(name => {
      map.removeImage(name);
      delete persistImages[name];
    });
    if (!Object.keys(persistImages).length) map.off('style.load', persistListener);
  };

  return { addImages, removeImages };
};
