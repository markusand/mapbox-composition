import type { Map, MapSourceDataEvent } from 'mapbox-gl';
import type { BaseLayerOptions } from '../layer';

export const useSourceEvents = (map: Map, sourceId: string, options: BaseLayerOptions) => {
  const { onError, onLoadStart, onLoadEnd } = options;
  let isSourceLoading = false;

  const sourceLoadStartHandler = (event: MapSourceDataEvent) => {
    const { sourceDataType = 'content' } = event; // Little hack here
    if (event.sourceId === sourceId && !isSourceLoading && sourceDataType === 'content') {
      onLoadStart?.(event);
      isSourceLoading = true;
    }
  };

  const sourceLoadEndHandler = (event: MapSourceDataEvent) => {
    if (event.sourceId === sourceId && isSourceLoading && map.isSourceLoaded(sourceId)) {
      onLoadEnd?.(event);
      isSourceLoading = false;
    }
  };

  const sourceErrorHandler = (event: any) => {
    if (event.sourceId === sourceId) onError?.(event.error);
  };

  const bindSourceEvents = () => {
    if (onLoadStart || onLoadEnd) map.on('sourcedataloading', sourceLoadStartHandler);
    if (onLoadEnd) map.on('sourcedata', sourceLoadEndHandler);
    if (onError) map.on('error', sourceErrorHandler);
  };

  const unbindSourceEvents = () => {
    map.off('sourcedataloading', sourceLoadStartHandler);
    map.off('sourcedata', sourceLoadEndHandler);
    map.off('error', sourceErrorHandler);
  };

  return { bindSourceEvents, unbindSourceEvents };
};
