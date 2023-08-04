import type { Map, MapLayerMouseEvent } from 'mapbox-gl';

export type { MapLayerMouseEvent };

export type LayerEventHandlers = {
  onClick?: (event: MapLayerMouseEvent) => void;
  onHover?: (event: MapLayerMouseEvent) => void;
};

export const useLayerEvents = (map: Map, { onClick, onHover }: LayerEventHandlers) => {
  const bind = (layerId: string) => {
    if (onClick) map.on('click', layerId, onClick);
    if (onHover) map.on('mousemove', layerId, onHover);
  };

  const unbind = (layerId: string) => {
    if (onClick) map.off('click', layerId, onClick);
    if (onHover) map.off('mouseenter', layerId, onHover);
  };

  return { bind, unbind };
};
