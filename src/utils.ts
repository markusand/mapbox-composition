export const debounce = (fn: Function, timeout: number): Function => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => { fn(...args); }, timeout);
  };
};

export const uuid = (): string => Math.random().toString(36).substring(7);

export const capitalize = (str: string): string => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

export const isObject = (item: unknown): boolean => (
  !!item && (item as { constructor: ObjectConstructor }).constructor === Object
);

export const toArray = <T>(item: T): T[] => (Array.isArray(item) ? item : [item]);
