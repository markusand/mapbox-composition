export default (map, sourceId, { onError, onLoadStart, onLoadEnd }) => {
	let isSourceLoading = false;

	const sourceLoadStartHandler = event => {
		const { sourceDataType = 'content' } = event; // Little hack here
		if (event.sourceId === sourceId && !isSourceLoading && sourceDataType === 'content') {
			if (onLoadStart) onLoadStart(event);
			isSourceLoading = true;
		}
	};

	const sourceLoadEndHandler = event => {
		if (event.sourceId === sourceId && isSourceLoading && map.isSourceLoaded(sourceId)) {
			if (onLoadEnd) onLoadEnd(event);
			isSourceLoading = false;
		}
	};

	const sourceErrorHandler = event => {
		if (event.sourceId === sourceId) onError(event.error);
	};

	const bindSourceEvents = () => {
		if (onLoadStart || onLoadEnd) map.on('sourcedataloading', sourceLoadStartHandler);
		if (onLoadEnd) map.on('sourcedata', sourceLoadEndHandler);
		if (onError) map.on('error', sourceErrorHandler);
	};

	const unbindSourceEvents = () => {
		map.off('sourcedataloading', sourceLoadStartHandler);
		map.off('sourcedata', sourceLoadEndHandler);
		map.off('error', sourceErrorHandler);
	};

	return { bindSourceEvents, unbindSourceEvents };
};
