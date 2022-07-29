import type { Popup } from 'mapbox-gl';
import type { PopupOptions } from '../types';

export default ({ onOpen, onClose }: PopupOptions) => {
  const bindPopupEvents = (popup: Popup) => {
    if (onOpen) popup.on('open', onOpen);
    if (onClose) popup.on('close', onClose);
  };

  const unbindPopupEvents = (popup: Popup) => {
    popup.off('open', onOpen);
    popup.off('close', onClose);
  };

  return { bindPopupEvents, unbindPopupEvents };
};
