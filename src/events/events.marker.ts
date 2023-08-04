import type { Marker, EventedListener } from 'mapbox-gl';

export type MarkerEvent<T> = { type: T; target: Marker };

export type MarkerEventHandlers = {
  onDragStart?: (event: MarkerEvent<'dragstart'>) => void;
  onDrag?: (event: MarkerEvent<'drag'>) => void;
  onDragEnd?: (event: MarkerEvent<'dragend'>) => void;
};

export const useMarkerEvents = (handlers: MarkerEventHandlers) => {
  const { onDragStart, onDrag, onDragEnd } = handlers;

  const bind = (marker: Marker) => {
    if (onDragStart) marker.on('dragstart', onDragStart as EventedListener);
    if (onDrag) marker.on('drag', onDrag as EventedListener);
    if (onDragEnd) marker.on('dragend', onDragEnd as EventedListener);
  };

  const unbind = (marker: Marker) => {
    if (onDragStart) marker.on('dragstart', onDragStart as EventedListener);
    if (onDrag) marker.on('drag', onDrag as EventedListener);
    if (onDragEnd) marker.on('dragend', onDragEnd as EventedListener);
  };

  return { bind, unbind };
};
