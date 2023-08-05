import type { Map, IControl } from 'mapbox-gl';

export type StylesControlStyle = {
  name: string;
  url: string;
  label?: string;
  img?: string;
};

export type StylesControlOptions = {
  styles?: StylesControlStyle[];
};

const defaults: StylesControlStyle[] = [
  {
    name: 'Mapbox Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    label: 'Street',
  },
  {
    name: 'Mapbox Satellite',
    url: 'mapbox://styles/mapbox/satellite-v9',
    label: 'Satellite',
  },
];

export default class StylesControl implements IControl {
  _styles: StylesControlStyle[];

  _active: string | undefined;

  _map: Map | undefined;

  _container: HTMLElement;

  _buttons: HTMLElement[] | undefined;

  constructor(options?: StylesControlOptions) {
    this._styles = options?.styles || defaults;
    this._setActive = this._setActive.bind(this);

    this._container = document.createElement('div');
    this._container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group', 'mapboxgl-ctrl-styles');
  }

  onAdd(map: Map) {
    this._map = map;

    this._container = document.createElement('div');
    this._container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group', 'mapboxgl-ctrl-styles');

    this._buttons = this._styles.map((style, i) => {
      const button = document.createElement('button');
      button.classList.add(`mapboxgl-ctrl-styles-${style.name.replace(/\W/g, '_').toLowerCase()}`);
      if (style.img) {
        const thumbnail = document.createElement('img');
        thumbnail.src = style.img;
        button.appendChild(thumbnail);
      } else {
        const label = document.createElement('em');
        label.textContent = style.label || `Style ${i}`;
        button.appendChild(label);
      }

      button.addEventListener('click', () => {
        if (this._active !== style.name) map.setStyle(style.url);
      });

      this._container.appendChild(button);

      return button;
    });

    this._map.on('style.load', this._setActive);

    this._setActive();

    return this._container;
  }

  _setActive() {
    if (!this._map || !this._buttons) return;
    this._buttons.forEach(button => button.classList.remove('is-active'));
    const { name } = this._map?.getStyle() || {};
    const index = this._styles.findIndex(style => style.name === name);
    if (index >= 0) this._buttons[index].classList.add('is-active');
    this._active = name;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
    this._map?.off('style.load', this._setActive);
    this._map = undefined;
  }
}
