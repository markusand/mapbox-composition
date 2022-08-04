import { Map, LngLatLike, Marker, MarkerOptions as MMarkerOptions, MapboxEvent } from 'mapbox-gl';
import { useMarkerEvents } from './events';
import type Popup from './popup';

type MarkerPopup = ReturnType<typeof Popup>;

export type MarkerOptions = {
  coordinates: LngLatLike;
  popup?: MarkerPopup;
  onDragStart?: (event: MapboxEvent) => void,
  onDrag?: (event: MapboxEvent) => void,
  onDragEnd?: (event: MapboxEvent) => void;
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
