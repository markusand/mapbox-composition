import type { Popup, EventedListener } from 'mapbox-gl';
import type { PopupOptions } from '../popup';

export const usePopupEvents = ({ onOpen, onClose }: PopupOptions) => {
  const bindPopupEvents = (popup: Popup) => {
    if (onOpen) popup.on('open', onOpen as EventedListener);
    if (onClose) popup.on('close', onClose as EventedListener);
  };

  const unbindPopupEvents = (popup: Popup) => {
    popup.off('open', onOpen as EventedListener);
    popup.off('close', onClose as EventedListener);
  };

  return { bindPopupEvents, unbindPopupEvents };
};
