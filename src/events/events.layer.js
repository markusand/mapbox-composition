export default (map, { onClick, onHover }) => {
	const layerClickHandler = event => onClick(event);
	const layerHoverHandler = event => onHover(event);

	const bindLayerEvents = layerId => {
		if (onClick) map.on('click', layerId, layerClickHandler);
		if (onHover) {
			map.on('mouseenter', layerId, layerHoverHandler);
			map.on('mousemove', layerId, layerHoverHandler);
			map.on('mouseleave', layerId, layerHoverHandler);
		}
	};

	const unbindLayerEvents = layerId => {
		map.off('click', layerId, layerClickHandler);
		map.off('mouseenter', layerId, layerHoverHandler);
		map.off('mousemove', layerId, layerHoverHandler);
		map.off('mouseleave', layerId, layerHoverHandler);
	};

	return { bindLayerEvents, unbindLayerEvents };
};
