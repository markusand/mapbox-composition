export default (map, options) => {
	Object.entries(options).forEach(([key, value]) => {
		if (key.startsWith('on')) {
			const eventName = key.slice(2).toLowerCase();
			map.on(eventName, value);
		}
	});
};
