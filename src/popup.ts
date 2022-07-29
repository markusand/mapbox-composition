import { Popup as MPopup } from 'mapbox-gl';
import type { Map, LngLatLike, EventedListener, PopupOptions as MPopupOptions } from 'mapbox-gl';
import { usePopupEvents } from './events';
import { uuid } from './utils';

export type PopupOptions = {
  name: string;
  coordinates?: LngLatLike;
  content?: string;
  onOpen?: EventedListener;
  onClose?: EventedListener;
} & MPopupOptions;

export default (...args: [Map, PopupOptions] | [PopupOptions]) => {
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
