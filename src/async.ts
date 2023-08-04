import { Map } from 'mapbox-gl';

const ACTIONS = ['panBy', 'panTo', 'zoomTo', 'zoomIn', 'zoomOut', 'rotateTo', 'resetNorth', 'snapToNorth', 'fitBounds', 'fitScreenCoordinates', 'jumpTo', 'easeTo', 'flyTo'] as const;

type AsyncActionsMap = {
  [k in typeof ACTIONS[number]]: (...args: Parameters<Map[k]>) => Promise<void>;
};

export const useAsync = (map: Map) => {
  return ACTIONS.reduce((acc, action) => {
    const eventName = action.toLowerCase();
    acc[action] = (...options: Parameters<Map[typeof action]>) => new Promise(resolve => {
      // @ts-ignore There is no way to make TypeScript understand this
      map[action](...options);
      map.fire(`${eventName}start`);
      map.once('moveend', () => {
        map.fire(`${eventName}end`);
        resolve();
      });
    });
    return acc;
  }, {} as AsyncActionsMap);
};
