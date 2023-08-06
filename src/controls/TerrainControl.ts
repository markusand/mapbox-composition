import type { Map, IControl } from 'mapbox-gl';
import { useTerrain, type TerrainExtrusion, type TerrainOptions } from '../terrain';
import type { Prettify } from '../utils';

export type TerrainControlOptions = Prettify<{
  extrudeOnInit?: boolean,
} & TerrainOptions & TerrainExtrusion>;

export default class TerraineControl implements IControl {
  _options: TerrainControlOptions;

  _container: HTMLElement;

  constructor(options: TerrainControlOptions = {}) {
    this._options = options;

    this._container = document.createElement('div');
    this._container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group');
  }

  onAdd(map: Map) {
    const { extrudeOnInit = false, exaggeration, pitch, ...options } = this._options;
    const terrain = useTerrain(map, options);

    const button = document.createElement('button');
    button.classList.add('mapboxgl-ctrl-terrain');
    this._container.appendChild(button);

    const extrude = (doExtrude: boolean) => {
      if (doExtrude) terrain.extrude({ exaggeration, pitch });
      else terrain.flatten();
      button.classList.toggle('mapboxgl-ctrl-terrain-3d', doExtrude);
    };

    button.addEventListener('click', () => extrude(!terrain.isExtruded()));

    // Reload terrain extrusion state on map style change
    map.on('style.load', () => extrude(terrain.isExtruded()));

    extrude(extrudeOnInit);

    return this._container;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
  }
}
