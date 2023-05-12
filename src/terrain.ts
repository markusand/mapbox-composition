import type { Map, SkyPaint, Fog, RasterDemSource } from 'mapbox-gl';

export type TerrainOptions = Partial<{
  sky: SkyPaint;
  fog: Fog;
} & RasterDemSource>;

export type TerrainExtrusion = {
  exaggeration?: number;
  pitch?: number;
};

const defaults: { TERRAIN: TerrainOptions, SKY: SkyPaint, FOG: Fog } = {
  TERRAIN: {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
  },
  SKY: {
    'sky-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0, 8, 1],
    'sky-type': 'atmosphere',
    'sky-atmosphere-sun-intensity': 5,
  },
  FOG: {
    range: [1.0, 12.0],
    color: '#ffffff',
    'horizon-blend': 0.1,
  },
};

export default (map: Map, options: TerrainOptions) => {
  const { sky = defaults.SKY, fog = defaults.FOG, ...terrain } = options;
  let extruded = false;

  const extrude = ({ exaggeration = 1.5, pitch = 45 }: TerrainExtrusion) => {
    extruded = true;
    map.addSource('mapboxgl-dem', { type: 'raster-dem', ...defaults.TERRAIN, ...terrain });
    map.setTerrain({ source: 'mapboxgl-dem', exaggeration });
    map.easeTo({ pitch });
    if (fog) map.setFog(fog);
    if (sky && !map.getLayer('mapboxgl-sky')) {
      map.addLayer({ id: 'mapboxgl-sky', type: 'sky', paint: sky });
    }
  };

  const flatten = () => {
    extruded = false;
    map.setTerrain();
    map.setFog(null!); // setFog accepts null to remove fog
    map.easeTo({ pitch: 0 });
    if (map.getSource('mapboxgl-dem')) map.removeSource('mapboxgl-dem');
    if (map.getLayer('mapboxgl-sky')) map.removeLayer('mapboxgl-sky');
  };

  const isExtruded = () => extruded;

  return { extrude, flatten, isExtruded };
};
