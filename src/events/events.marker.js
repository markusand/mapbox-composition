export default ({ onDragStart, onDrag, onDragEnd }) => {
	const bindMarkerEvents = marker => {
		if (onDragStart) marker.on('dragstart', onDragStart);
		if (onDrag) marker.on('drag', onDrag);
		if (onDragEnd) marker.on('dragend', onDragEnd);
	};

	const unbindMarkerEvents = marker => {
		marker.on('dragstart', onDragStart);
		marker.on('drag', onDrag);
		marker.on('dragend', onDragEnd);
	};

	return { bindMarkerEvents, unbindMarkerEvents };
};
