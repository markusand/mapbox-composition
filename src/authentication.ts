import type { TransformRequestFunction, ResourceType } from 'mapbox-gl';

const AUTHENTICATORS: Map<string, { urls: string[], token: string }> = new Map();

export const transformRequest: TransformRequestFunction = (url: string, type: ResourceType) => {
  return [...AUTHENTICATORS.values()].reduce((acc, { urls, token }) => {
    return ['Source', 'Tile'].includes(type) && urls.includes(new URL(url).origin)
      ? { url, headers: { Authorization: `Bearer ${token}` } }
      : acc;
  }, { url });
};

export const useAuthentication = (id: string) => {
  const set = (urls: string[], token: string) => {
    const origins = [...new Set(urls.map(url => new URL(url).origin))];
    AUTHENTICATORS.set(id, { urls: origins, token });
  };

  const clear = () => AUTHENTICATORS.delete(id);

  const updateURLs = (urls: string[]) => {
    const { token } = AUTHENTICATORS.get(id)!;
    AUTHENTICATORS.set(id, { urls, token });
  };

  const updateToken = (token: string) => {
    const { urls } = AUTHENTICATORS.get(id)!;
    AUTHENTICATORS.set(id, { urls, token });
  };

  return { set, clear, updateURLs, updateToken };
};
