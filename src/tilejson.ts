import type { Prettify } from './utils';

type TileJSONBase = {
  name?: string;
  description?: string;
  version?: `${number}.${number}.${number}`;
  attribution?: string;
  legend?: string;
  scheme?: 'xyz' | 'tms';
  tiles: string[];
  grids?: string[];
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  center?: [number, number, number];
};

export type TileJSONv1 = Prettify<{
  tilejson: '1.0.0';
  formatter?: string;
} & TileJSONBase>;

export type TileJSONv2 = Prettify<{
  tilejson: '2.0.0' | '2.0.1' | '2.1.0' | '2.2.0';
  template?: string;
  data?: string[];
} & TileJSONBase>;

export type TileJSONv3 = Prettify<{
  tilejson: '3.0.0';
  vector_layers: {
    id: string;
    fields: Record<string, string>;
    description?: string;
    minzoom?: number;
    maxzoom?: number;

  }[];
  data?: string[];
  fillzoom?: number;
  template?: string;
} & TileJSONBase>;

export type TileJSON = TileJSONv1 | TileJSONv2 | TileJSONv3;
