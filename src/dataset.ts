import type { Map, AnySourceData, AnyLayer, Expression, CustomLayerInterface } from 'mapbox-gl';
import { useSourceEvents, useLayerEvents, type SourceEventHandlers, type LayerEventHandlers } from './events';
import type { Prettify } from './utils';

export type LayerOptions = Prettify<{
  visible?: boolean;
  under?: string;
  // TODO add `over`
  filter?: Expression;
} & AnyLayer>;

export type DatasetOptions = Prettify<{
  id: string;
  source?: AnySourceData;
  layers: LayerOptions[];
  persist?: boolean;
  under?: string;
} & SourceEventHandlers & LayerEventHandlers>;

type DatasetCache = {
  source: AnySourceData | undefined;
  layers: Record<string, LayerOptions>;
};

const isCustomLayer = (layer: AnyLayer): layer is CustomLayerInterface => layer.type === 'custom';

export const useDataset = (map: Map, options: DatasetOptions) => {
  const sourceEvents = useSourceEvents(map, options.id, options);
  const layerEvents = useLayerEvents(map, options);

  const cache: DatasetCache = {
    source: undefined,
    layers: {},
  };

  const setVisibility = (isVisible: boolean, layerIds = Object.keys(cache.layers)) => {
    const visibility = isVisible ? 'visible' : 'none';
    layerIds.forEach(id => {
      cache.layers[id].visible = isVisible;
      map.setLayoutProperty(id, 'visibility', visibility);
    });
  };

  const isVisible = (layerIds: string[] = Object.keys(cache.layers)) => (
    layerIds.every(id => map.getLayoutProperty(id, 'visibility') === 'visible')
  );

  const setFilter = (filter: Expression | null, layerIds = Object.keys(cache.layers)) => {
    layerIds.forEach(id => {
      cache.layers[id].filter = filter ?? undefined;
      map.setFilter(id, filter);
    });
  };

  const hasLayer = (id: string) => !!cache.layers[id] && !!map.getLayer(id);

  const clearLayers = (layerIds: string[] = Object.keys(cache.layers)) => {
    layerIds.forEach(id => {
      layerEvents.unbind(id);
      if (hasLayer(id)) map.removeLayer(id);
      delete cache.layers[id];
    });
  };

  const updateLayers = (layers: LayerOptions[]) => {
    layers.forEach(layer => {
      // @ts-ignore TS does not recognise paint and layout in AnyLayer union type
      const { id, visible, filter, under, paint = {}, layout = {} } = layer;
      if (visible !== undefined) setVisibility(visible, [id]);
      if (filter !== undefined) setFilter(filter, [id]);
      if (under && map.getLayer(under)) map.moveLayer(id, under);
      Object.entries(paint).forEach(([prop, value]) => map.setPaintProperty(id, prop, value));
      Object.entries(layout).forEach(([prop, value]) => map.setLayoutProperty(id, prop, value));
      cache.layers[id] = layer;
    });
  };

  const addLayers = (layers: LayerOptions[]) => layers.forEach(layer => {
    const { under = options.under, visible = true, ...params } = layer;
    const z = under && map.getLayer(under) ? under : undefined;
    cache.layers[params.id] = { under, visible, ...params };
    if (isCustomLayer(params)) map.addLayer(params, z);
    else map.addLayer({ ...params, source: options.id }, z);
    setVisibility(visible, [params.id]);
    layerEvents.bind(params.id);
  });

  const reloadCache = () => {
    /* eslint-disable @typescript-eslint/no-use-before-define */
    if (cache.source) {
      setSource(cache.source);
      addLayers(Object.values(cache.layers));
    }
  };

  const clearSource = () => {
    clearLayers();
    sourceEvents.unbind();
    map.removeSource(options.id);
    map.off('style.load', reloadCache);
  };

  const setSource = (source: AnySourceData) => {
    map.addSource(options.id, source);
    addLayers(options.layers);
    if (options.persist ?? true) {
      cache.source = source;
      map.on('style.load', reloadCache);
    }
  };

  if (options.source) setSource(options.source);

  return {
    clearLayers,
    updateLayers,
    addLayers,
    hasLayer,
    clearSource,
    setSource,
    isVisible,
    setVisibility,
    setFilter,
  };
};

export type Dataset = ReturnType<typeof useDataset>;
