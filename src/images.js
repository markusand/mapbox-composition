export default map => {
	let persistImages = {};
	let persistListener;

	const loadImage = ([name, path]) => new Promise((resolve, reject) => {
		if (map.hasImage(name)) return resolve();
		return map.loadImage(path, (error, image) => {
			if (error) return reject(error);
			map.addImage(name, image);
			return resolve();
		});
	});

	const addImages = async (images, options = {}) => {
		const { persist = true } = options;
		if (persist) {
			persistImages = { ...persistImages, ...images };
			if (!persistListener) {
				persistListener = () => Object.entries(persistImages).map(loadImage);
				map.on('style.load', persistListener);
			}
		}
		const loaded = Object.entries(images).map(loadImage);
		return Promise.all(loaded);
	};

	const removeImages = images => {
		const names = Array.isArray(images) ? images : Object.keys(images);
		names.forEach(name => {
			map.removeImage(name);
			delete persistImages[name];
		});
		if (!Object.keys(persistImages).length) {
			map.off('style.load', persistListener);
			persistListener = null;
		}
	};

	return { addImages, removeImages };
};
