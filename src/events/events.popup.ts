import type { Popup, EventedListener } from 'mapbox-gl';

export type PopupEvent<T> = { type: T, target: Popup };

export type PopupEventHandlers = {
  onOpen?: (event: PopupEvent<'open'>) => void;
  onClose?: (event: PopupEvent<'close'>) => void;
};

export const usePopupEvents = (handlers: PopupEventHandlers) => {
  const { onOpen, onClose } = handlers;

  const bind = (popup: Popup) => {
    if (onOpen) popup.on('open', onOpen as EventedListener);
    if (onClose) popup.on('close', onClose as EventedListener);
  };

  const unbind = (popup: Popup) => {
    if (onOpen) popup.off('open', onOpen as EventedListener);
    if (onClose) popup.off('close', onClose as EventedListener);
  };

  return { bind, unbind };
};
