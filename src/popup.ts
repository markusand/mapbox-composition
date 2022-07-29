import { Popup as MPopup } from 'mapbox-gl';
import type { Map, LngLatLike } from 'mapbox-gl';
import type { Popup, PopupOptions } from './types';
import { usePopupEvents } from './events';
import { uuid } from './utils';

export default (...args: [Map, PopupOptions] | [PopupOptions]): Popup => {
  const [map, options] = args.length === 1 ? [, args[0]] : args;
  const { content, coordinates, name = `popup-${uuid()}`, ...rest } = options;
  const { bindPopupEvents } = usePopupEvents(options);

  const popup = new MPopup(rest);

  const setLocation = (location: LngLatLike) => {
    if (map) popup.setLngLat(location).addTo(map);
  };
  const setContent = (newContent: string) => { popup.setHTML(newContent); };

  // Instantiate
  if (coordinates) setLocation(coordinates);
  setContent(content || `<div id="${name}"></div>`);
  bindPopupEvents(popup);

  return {
    get popup() { return popup; },
    name,
    setLocation,
    setContent,
  };
};
