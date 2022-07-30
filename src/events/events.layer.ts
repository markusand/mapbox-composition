import type { Map, MapLayerMouseEvent } from 'mapbox-gl';
import type { BaseLayerOptions } from '../layer';

export default (map: Map, { onClick, onHover }: BaseLayerOptions) => {
  const layerClickHandler = (event: MapLayerMouseEvent) => onClick?.(event);
  const layerHoverHandler = (event: MapLayerMouseEvent) => onHover?.(event);

  const bindLayerEvents = (layerId: string) => {
    if (onClick) map.on('click', layerId, layerClickHandler);
    if (onHover) {
      map.on('mouseenter', layerId, layerHoverHandler);
      map.on('mousemove', layerId, layerHoverHandler);
      map.on('mouseleave', layerId, layerHoverHandler);
    }
  };

  const unbindLayerEvents = (layerId: string) => {
    map.off('click', layerId, layerClickHandler);
    map.off('mouseenter', layerId, layerHoverHandler);
    map.off('mousemove', layerId, layerHoverHandler);
    map.off('mouseleave', layerId, layerHoverHandler);
  };

  return { bindLayerEvents, unbindLayerEvents };
};
