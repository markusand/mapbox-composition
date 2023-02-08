import type {
  Map,
  AnySourceData,
  AnyLayer,
  Source,
  Layer,
  MapSourceDataEvent,
  MapLayerMouseEvent,
} from 'mapbox-gl';
import { useSourceEvents, useLayerEvents } from './events';
import { isObject } from './utils';

type TilesJSONSource = {
  tilejson: `${number}.${number}.${number}`;
  name?: string | null;
  description?: string | null;
  version?: `${number}.${number}.${number}`;
  attribution?: string | null;
  template?: string | null;
  legend?: string | null;
  scheme?: 'xyz' | 'tms';
  tiles: string[];
  grids?: string[];
  data?: string[];
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  center?: [number, number, number];
};

export type LayerError = Error & {
  status?: number;
  url?: string;
};

export type LayerOptions = {
  name: string;
  visible?: boolean;
  under?: string;
  filter?: any[];
} & Omit<Layer, 'id'>;

export type BaseLayerOptions = {
  name: string;
  type: Source['type'];
  source: AnySourceData | TilesJSONSource | string;
  layers: LayerOptions[];
  promoteId?: string | Record<string, string>;
  generateId?: boolean;
  persist?: boolean;
  under?: string;
  onError?: (error: LayerError) => any,
  onLoadStart?: (event: MapSourceDataEvent) => any;
  onLoadEnd?: (event: MapSourceDataEvent) => any;
  onClick?: (event: MapLayerMouseEvent) => any;
  onHover?: (event: MapLayerMouseEvent) => any;
};

/* Trust in function hoisting for persistance handlers */
/* eslint-disable @typescript-eslint/no-use-before-define */

export default (map: Map, options: BaseLayerOptions) => {
  const { bindSourceEvents, unbindSourceEvents } = useSourceEvents(map, options.name, options);
  const { bindLayerEvents, unbindLayerEvents } = useLayerEvents(map, options);
  const LAYERS: Record<string, LayerOptions> = {};

  const setVisibility = (isVisible: boolean, layerIds = Object.keys(LAYERS)) => {
    const visibility = isVisible ? 'visible' : 'none';
    layerIds.forEach(id => {
      LAYERS[id].visible = isVisible;
      map.setLayoutProperty(id, 'visibility', visibility);
    });
  };

  const isVisible = (layerId: string) => map.getLayoutProperty(layerId, 'visibility') === 'visible';

  const setFilters = (filters: any[] = [], layerIds = Object.keys(LAYERS)) => {
    const all = isObject(filters) ? ['all', ...Object.values(filters).filter(Boolean)] : filters;
    layerIds.forEach(id => {
      LAYERS[id].filter = all && all.length ? all : LAYERS[id].filter;
      map.setFilter(id, LAYERS[id].filter);
    });
  };

  const persistLayerHandler = () => addLayers(Object.values(LAYERS));

  const clearLayers = (layerIds: string[] = Object.keys(LAYERS)) => {
    layerIds.forEach(id => {
      unbindLayerEvents(id);
      if (map.getLayer(id)) map.removeLayer(id);
      if (id in LAYERS) delete LAYERS[id];
    });
    map.off('style.load', persistLayerHandler);
  };

  const updateLayers = (layers: LayerOptions[] = []) => {
    layers.forEach(layer => {
      const { name, visible, filter, under, paint = {}, layout = {} } = layer;
      if (visible !== undefined) setVisibility(visible, [name]);
      if (filter !== undefined) setFilters(filter, [name]);
      if (under && map.getLayer(under)) map.moveLayer(name, under);
      Object.entries(paint).forEach(([prop, val]) => map.setPaintProperty(name, prop, val));
      Object.entries(layout).forEach(([prop, val]) => map.setLayoutProperty(name, prop, val));
      LAYERS[name] = { ...LAYERS[name], ...layer };
    });
  };

  const addLayers = (layers: LayerOptions[]) => {
    const { name: sourceName, persist = true, under: globalUnder } = options;
    layers.forEach(({ name, under = globalUnder, visible = true, ...params }, i) => {
      const id = name || `${sourceName}--${i}`;
      LAYERS[id] = { name, under, visible, ...params };
      const zPosition = under && map.getLayer(under) ? under : undefined;
      map.addLayer({ ...params, source: sourceName, id } as AnyLayer, zPosition);
      setVisibility(visible, [id]);
      bindLayerEvents(id);
    });
    if (persist) map.once('style.load', persistLayerHandler);
  };

  const hasLayer = (id: string) => !!LAYERS[id] && !!map.getLayer(id);

  let persistSourceHandler: () => void;

  const clearSource = () => {
    clearLayers();
    unbindSourceEvents();
    if (map.getSource(options.name)) map.removeSource(options.name);
    map.off('style.load', persistSourceHandler);
  };

  const setSource = (source: BaseLayerOptions['source']) => {
    clearSource();
    const { name, type, promoteId, generateId = false, persist = true } = options;
    const key = type === 'geojson' ? 'data' : type === 'video' ? 'urls' : 'url';
    const content = typeof source === 'string' ? { [key]: source } : source;
    map.addSource(name, { ...content, promoteId, generateId, type } as AnySourceData);
    bindSourceEvents();
    persistSourceHandler = () => updateSource(source);
    if (persist) map.once('style.load', persistSourceHandler);
  };

  const updateSource = (source: BaseLayerOptions['source'], layers = Object.values(LAYERS)) => {
    setSource(source);
    addLayers(layers);
  };

  setSource(options.source);
  addLayers(options.layers);

  return {
    clearLayers,
    updateLayers,
    addLayers,
    hasLayer,
    clearSource,
    setSource,
    updateSource,
    isVisible,
    setVisibility,
    setFilters,
    type: options.type,
  };
};
