import './styles.control.css';

export default class StylesControl {
	constructor({ styles }) {
		this._styles = styles;
		this._active = null;
		this._setActive = this._setActive.bind(this);
	}

	onAdd(map) {
		this._map = map;

		this._container = document.createElement('div');
		this._container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group', 'mapboxgl-ctrl-styles');

		this._buttons = this._styles.map(style => {
			const button = document.createElement('button');
			if (style.img) {
				const thumbnail = document.createElement('img');
				thumbnail.src = style.img;
				button.appendChild(thumbnail);
			} else {
				const label = document.createElement('span');
				label.textContent = style.label;
				button.appendChild(label);
			}
			button.addEventListener('click', () => {
				if (this._active !== style.name) this._map.setStyle(style.url);
			});
			this._container.appendChild(button);
			return button;
		});

		this._map.on('style.load', this._setActive);

		this._setActive();

		return this._container;
	}

	_setActive() {
		this._buttons.forEach(button => button.classList.remove('is-active'));
		const { name } = this._map.getStyle();
		const index = this._styles.findIndex(style => style.name === name);
		if (index >= 0) this._buttons[index].classList.add('is-active');
		this._active = name;
	}

	onRemove() {
		this._container.parentNode.removeChild(this._container);
		this._map.off('style.load', this._setActive);
		this._map = undefined;
	}
}
