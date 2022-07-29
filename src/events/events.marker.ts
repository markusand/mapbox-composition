import type { Marker } from 'mapbox-gl';
import type { MarkerOptions } from '../types';

export default ({ onDragStart, onDrag, onDragEnd }: MarkerOptions) => {
  const bindMarkerEvents = (marker: Marker) => {
    if (onDragStart) marker.on('dragstart', onDragStart);
    if (onDrag) marker.on('drag', onDrag);
    if (onDragEnd) marker.on('dragend', onDragEnd);
  };

  const unbindMarkerEvents = (marker: Marker) => {
    if (onDragStart) marker.on('dragstart', onDragStart);
    if (onDrag) marker.on('drag', onDrag);
    if (onDragEnd) marker.on('dragend', onDragEnd);
  };

  return { bindMarkerEvents, unbindMarkerEvents };
};
