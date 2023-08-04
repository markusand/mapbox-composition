import type { Map, MapSourceDataEvent } from 'mapbox-gl';

export type SourceError = Error & {
  status?: number;
  url?: string;
};

export type SourceEventHandlers = {
  onLoadStart?: (event: MapSourceDataEvent) => void;
  onLoadEnd?: (event: MapSourceDataEvent) => void;
  onError?: (error: SourceError) => void;
};

export const useSourceEvents = (map: Map, sourceId: string, handlers: SourceEventHandlers) => {
  const { onError, onLoadStart, onLoadEnd } = handlers;
  let isSourceLoading = false;

  const sourceLoadStartHandler = (event: MapSourceDataEvent) => {
    const { sourceDataType = 'content' } = event; // Little hack here
    if (event.sourceId === sourceId && !isSourceLoading && sourceDataType === 'content') {
      isSourceLoading = true;
      onLoadStart?.(event);
    }
  };

  const sourceLoadEndHandler = (event: MapSourceDataEvent) => {
    if (event.sourceId === sourceId && isSourceLoading && map.isSourceLoaded(sourceId)) {
      onLoadEnd!(event);
      isSourceLoading = false;
    }
  };

  const sourceErrorHandler = (event: any) => {
    if (event.sourceId === sourceId) onError!(event.error);
  };

  const bind = () => {
    if (onLoadStart || onLoadEnd) map.on('sourcedataloading', sourceLoadStartHandler);
    if (onLoadEnd) map.on('sourcedata', sourceLoadEndHandler);
    if (onError) map.on('error', sourceErrorHandler);
  };

  const unbind = () => {
    if (onLoadStart || onLoadEnd)   map.off('sourcedataloading', sourceLoadStartHandler);
    if (onLoadEnd) map.off('sourcedata', sourceLoadEndHandler);
    if (onError) map.off('error', sourceErrorHandler);
  };

  return { bind, unbind };
};
