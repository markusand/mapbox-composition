import { Marker as MMarker } from 'mapbox-gl';
import type { Map, LngLatLike } from 'mapbox-gl';
import type { Popup, Marker, MarkerOptions } from './types';
import { useMarkerEvents } from './events';

export default (map: Map, options: MarkerOptions): Marker => {
  const { coordinates, popup, ...rest } = options;
  const { bindMarkerEvents } = useMarkerEvents(options);

  const marker = new MMarker(rest);
  let _popup: Popup;

  const setLocation = (location: LngLatLike) => { marker.setLngLat(location).addTo(map); };
  const setPopup = (newPopup: Popup) => {
    _popup = newPopup;
    marker.setPopup(newPopup.popup);
  };

  // Instantiate
  if (popup) setPopup(popup);
  setLocation(coordinates);
  bindMarkerEvents(marker);

  return {
    setLocation,
    get marker() { return marker; },
    get popup() { return _popup; },
    set popup(newPopup) { setPopup(newPopup); },
  };
};
