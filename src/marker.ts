import { Marker } from 'mapbox-gl';
import type { Map, LngLatLike, EventedListener, MarkerOptions as MMarkerOptions } from 'mapbox-gl';
import { useMarkerEvents } from './events';
import Popup from './popup';

type MarkerPopup = ReturnType<typeof Popup>;

export type MarkerOptions = {
  coordinates: LngLatLike;
  popup?: MarkerPopup;
  onDragStart?: EventedListener,
  onDrag?: EventedListener,
  onDragEnd?: EventedListener;
} & MMarkerOptions;

export default (map: Map, options: MarkerOptions) => {
  const { coordinates, popup, ...rest } = options;
  const { bindMarkerEvents } = useMarkerEvents(options);

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
  bindMarkerEvents(marker);

  return {
    setLocation,
    get marker() { return marker; },
    get popup() { return markerPopup; },
    set popup(newPopup) { setPopup(newPopup); },
  };
};
