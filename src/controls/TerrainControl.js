import useTerrain from '../terrain';
import './terrain.control.css';

export default class TerrainControl {
	constructor(options = {}) {
		this._options = options;
	}

	onAdd(map) {
		const { extrudeOnInit = false, exaggeration, ...options } = this._options;
		const terrain = useTerrain(map, options);

		this._container = document.createElement('div');
		this._container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group');

		const button = document.createElement('button');
		button.classList.add('mapboxgl-ctrl-terrain');
		this._container.appendChild(button);

		const extrude = doExtrude => {
			if (doExtrude) terrain.extrude(exaggeration);
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
		this._container.parentNode.removeChild(this._container);
	}
}
