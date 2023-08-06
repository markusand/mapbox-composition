export type Prettify<T> = {
  [k in keyof T]: T[k];
} & {};

export const uuid = (): string => Math.random().toString(36).substring(7);

export const capitalize = (str: string): string => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

export const isObject = (item: unknown): boolean => (
  !!item && (item as { constructor: ObjectConstructor }).constructor === Object
);

export const toArray = <T>(item: T): T[] => (Array.isArray(item) ? item : [item]);

export const debounce = <T extends any[]>(callback: (...args: T) => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), delay);
  };
};

export const extract = <
  T extends object,
  K extends keyof T,
>(object: T, keys: readonly K[]): [Pick<T, K>, Omit<T, K>] => {
  const { picked, omited } = keys.reduce((acc, key) => {
    const { [key]: value, ...rest } = acc.omited;
    return value
      ? { picked: { ...acc.picked, [key]: value }, omited: rest as Omit<T, K> }
      : acc;
  }, { picked: {} as Pick<T, K>, omited: object as Omit<T, K> });
  return [picked, omited];
};
