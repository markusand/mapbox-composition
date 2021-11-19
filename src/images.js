export default map => {
	let persistImageListener;

	const loader = ([name, path]) => new Promise((resolve, reject) => {
		if (map.hasImage(name)) resolve();
		map.loadImage(path, (error, image) => {
			if (error) reject(error);
			map.addImage(name, image);
			resolve();
		});
	});

	const addImages = async (images, options = {}) => {
		const { persist = true } = options;
		if (persist) {
			persistImageListener = () => addImages(images, options);
			map.once('style.load', persistImageListener);
		}
		const loaded = Object.entries(images).map(loader);
		await Promise.all(loaded);
	};

	const removeImages = images => {
		const names = Array.isArray(images) ? images : Object.keys(images);
		names.forEach(name => map.removeImage(name));
		map.off('style.load', persistImageListener);
	};

	return { addImages, removeImages };
};
