import {
  NavigationControl,
  ScaleControl,
  GeolocateControl,
  AttributionControl,
  FullscreenControl,
  type Map,
  type IControl,
} from 'mapbox-gl';
import StylesControl, { type StylesControlOptions, type StylesControlStyle } from './StylesControl';
import TerrainControl, { type TerrainControlOptions } from './TerrainControl';

export type { StylesControlOptions, StylesControlStyle, TerrainControlOptions };

export type ControlPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export type ControlOptions<T extends new (...args: any[]) => any> = {
  position?: ControlPosition;
} & ConstructorParameters<T>[0];

export type ControlsOptions = {
  navigation: ControlOptions<typeof NavigationControl>,
  scale: ControlOptions<typeof ScaleControl>,
  geolocate: ControlOptions<typeof GeolocateControl>,
  attribution: ControlOptions<typeof AttributionControl>,
  fullscreen: ControlOptions<typeof FullscreenControl>,
  styles: ControlOptions<typeof StylesControl>,
  terrain: ControlOptions<typeof TerrainControl>,
};

export default (map: Map) => {
  const CONTROLS: Record<string, IControl> = {};

  const addControl = (name: string, position: ControlPosition, control: IControl) => {
    CONTROLS[name] = control;
    map.addControl(control, position);
    return control;
  };

  const removeControl = (name: string) => {
    if (CONTROLS[name]) {
      map.removeControl(CONTROLS[name]);
      delete CONTROLS[name];
    }
  };

  const hasControl = (name: string) => !!CONTROLS[name] && map.hasControl(CONTROLS[name]);

  const addNavigation = (options: ControlsOptions['navigation'] = {}) => {
    const { position = 'top-right', ...config } = options;
    return addControl('navigation', position, new NavigationControl(config));
  };

  const addScale = (options: ControlsOptions['scale'] = {}) => {
    const { position = 'bottom-left', ...config } = options;
    return addControl('scale', position, new ScaleControl(config));
  };

  const addGeolocate = (options: ControlsOptions['geolocate'] = {}) => {
    const { position = 'top-right', ...config } = options;
    return addControl('geolocate', position, new GeolocateControl(config));
  };

  const addAttribution = (options: ControlsOptions['attribution'] = {}) => {
    const { position = 'bottom-right', ...config } = options;
    return addControl('attribution', position, new AttributionControl(config));
  };

  const addFullscreen = (options: ControlsOptions['fullscreen'] = {}) => {
    const { position = 'top-right', ...config } = options;
    return addControl('fullscreen', position, new FullscreenControl(config));
  };

  const addStyles = (options: ControlsOptions['styles'] = {}) => {
    const { position = 'top-right', ...config } = options;
    return addControl('styles', position, new StylesControl(config));
  };

  const addTerrain = (options: ControlsOptions['terrain'] = {}) => {
    const { position = 'top-right', ...config } = options;
    return addControl('terrain', position, new TerrainControl(config));
  };

  const removeNavigation = () => removeControl('navigation');
  const removeScale = () => removeControl('scale');
  const removeGeolocate = () => removeControl('geolocate');
  const removeAttribution = () => removeControl('attribution');
  const removeFullscreen = () => removeControl('fullscreen');
  const removeStyles = () => removeControl('styles');
  const removeTerrain = () => removeControl('terrain');

  return {
    addControl,
    removeControl,
    hasControl,
    addNavigation,
    addScale,
    addGeolocate,
    addAttribution,
    addFullscreen,
    addStyles,
    addTerrain,
    removeNavigation,
    removeScale,
    removeGeolocate,
    removeAttribution,
    removeFullscreen,
    removeStyles,
    removeTerrain,
  };
};
