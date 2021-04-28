export default ({ onOpen, onClose }) => {
	const bindPopupEvents = popup => {
		if (onOpen) popup.on('open', onOpen);
		if (onClose) popup.on('close', onClose);
	};

	const unbindPopupEvents = popup => {
		popup.off('open', onOpen);
		popup.off('close', onClose);
	};

	return { bindPopupEvents, unbindPopupEvents };
};
