import { NavigationControl, ScaleControl, GeolocateControl, AttributionControl, FullscreenControl } from 'mapbox-gl';
import type { Map, IControl } from 'mapbox-gl';
import StylesControl, { StylesControlOptions } from './StylesControl';
import TerrainControl, { TerrainControlOptions } from './TerrainControl';

export type { StylesControlOptions, TerrainControlOptions };

export type ControlPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export type ControlName = 'navigation' | 'scale' | 'geolocate' | 'attribution' | 'fullscreen' | 'styles' | 'terrain';

export type ControlOptions = {
  position?: ControlPosition;
} & Record<string, any>;

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

  const addNavigation = ({ position = 'top-right', ...config }: ControlOptions = {}) => (
    addControl('navigation', position, new NavigationControl(config))
  );

  const addScale = ({ position = 'bottom-left', ...config }: ControlOptions = {}) => (
    addControl('scale', position, new ScaleControl(config))
  );

  const addGeolocate = ({ position = 'top-right', ...config }: ControlOptions = {}) => (
    addControl('geolocate', position, new GeolocateControl(config))
  );

  const addAttribution = ({ position = 'bottom-right', ...config }: ControlOptions = {}) => (
    addControl('attribution', position, new AttributionControl(config))
  );

  const addFullscreen = ({ position = 'top-right', ...config }: ControlOptions = {}) => (
    addControl('fullscreen', position, new FullscreenControl(config))
  );

  const addStyles = ({ position = 'top-right', ...config }: StylesControlOptions = {}) => (
    addControl('styles', position, new StylesControl(config))
  );

  const addTerrain = ({ position = 'top-right', ...config }: TerrainControlOptions = {}) => (
    addControl('terrain', position, new TerrainControl(config))
  );

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
