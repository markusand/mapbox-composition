import { Map, type LngLatLike, Marker, type MarkerOptions as MMarkerOptions } from 'mapbox-gl';
import { useMarkerEvents, type MarkerEventHandlers } from './events';
import type Popup from './popup';

type MarkerPopup = ReturnType<typeof Popup>;

export type MarkerOptions = {
  coordinates: LngLatLike;
  popup?: MarkerPopup;
} & MMarkerOptions & MarkerEventHandlers;

export default (map: Map, options: MarkerOptions) => {
  const { coordinates, popup, ...rest } = options;
  const events = useMarkerEvents(options);

  const marker = new Marker(rest);
  let markerPopup: MarkerPopup;

  const setLocation = (location: LngLatLike) => { marker.setLngLat(location).addTo(map); };
  const setPopup = (newPopup: MarkerPopup) => {
    markerPopup = newPopup;
    marker.setPopup(newPopup.popup);
  };

  // Instantiate
  if (popup) setPopup(popup);
  setLocation(coordinates);
  events.bind(marker);

  return {
    setLocation,
    get marker() { return marker; },
    get popup() { return markerPopup; },
    set popup(newPopup) { setPopup(newPopup); },
  };
};
