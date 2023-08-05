import { Map, Popup as RawPopup, type LngLatLike, type PopupOptions as RawOptions } from 'mapbox-gl';
import { usePopupEvents, type PopupEventHandlers } from './events';
import { uuid } from './utils';

export type PopupOptions = {
  name?: string;
  coordinates?: LngLatLike;
  content?: string;
} & RawOptions & PopupEventHandlers;

export const usePopup = (...args: [Map, PopupOptions] | [PopupOptions]) => {
  const [map, options] = args.length === 1 ? [, args[0]] : args;
  const events = usePopupEvents(options);

  const name = options.name || `popup-${uuid()}`;

  const popup = new RawPopup(options);
  events.bind(popup);

  const setLocation = (location: LngLatLike) => {
    if (map) popup.setLngLat(location).addTo(map);
  };
  if (options.coordinates) setLocation(options.coordinates);

  const setContent = (content: string) => {
    popup.setHTML(content);
  };
  setContent(options.content || `<div id="${name}"></div>`);

  return {
    name,
    get _popup() { return popup; },
    setLocation,
    setContent,
  };
};

export type Popup = ReturnType<typeof usePopup>;
