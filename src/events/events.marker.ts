import type { Marker, EventedListener } from 'mapbox-gl';
import type { MarkerOptions } from '../marker';

export default ({ onDragStart, onDrag, onDragEnd }: MarkerOptions) => {
  const bindMarkerEvents = (marker: Marker) => {
    if (onDragStart) marker.on('dragstart', onDragStart as EventedListener);
    if (onDrag) marker.on('drag', onDrag as EventedListener);
    if (onDragEnd) marker.on('dragend', onDragEnd as EventedListener);
  };

  const unbindMarkerEvents = (marker: Marker) => {
    if (onDragStart) marker.on('dragstart', onDragStart as EventedListener);
    if (onDrag) marker.on('drag', onDrag as EventedListener);
    if (onDragEnd) marker.on('dragend', onDragEnd as EventedListener);
  };

  return { bindMarkerEvents, unbindMarkerEvents };
};
