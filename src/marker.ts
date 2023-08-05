import { Map, Marker as RawMarker, type LngLatLike, type MarkerOptions as RawOptions } from 'mapbox-gl';
import { useMarkerEvents, type MarkerEventHandlers } from './events';
import type { Popup } from './popup';

export type MarkerOptions = {
  coordinates: LngLatLike;
  popup?: Popup;
} & RawOptions & MarkerEventHandlers;

export const useMarker = (map: Map, options: MarkerOptions) => {
  const events = useMarkerEvents(options);

  const marker = new RawMarker(options);
  events.bind(marker);

  const setLocation = (location: LngLatLike) => {
    marker.setLngLat(location).addTo(map);
  };
  setLocation(options.coordinates);

  let markerPopup: Popup;
  const setPopup = (popup: Popup) => {
    markerPopup = popup;
    marker.setPopup(popup._popup);
  };
  if (options.popup) setPopup(options.popup);

  return {
    setLocation,
    get _marker() { return marker; },
    get popup() { return markerPopup; },
    set popup(popup) { setPopup(popup); },
  };
};

export type Marker = ReturnType<typeof useMarker>;
