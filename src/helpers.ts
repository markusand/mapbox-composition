import { LngLatBounds } from 'mapbox-gl';
import type { FeatureCollection, Feature, Geometry } from 'geojson';

type GeometryType = Exclude<Geometry['type'], 'GeometryCollection'>;

const bbox = (geojson: FeatureCollection | Feature) => {
  const depth: Record<GeometryType, number> = {
    Point: 0,
    MultiPoint: 1,
    LineString: 1,
    MultiLineString: 2,
    Polygon: 2,
    MultiPolygon: 3,
  };

  const features = 'features' in geojson ? geojson.features : [geojson];
  return features.reduce((acc, { geometry }) => {
    if (geometry.type !== 'GeometryCollection') {
      const coordinates = [geometry.coordinates].flat(depth[geometry.type]) as [number, number][];
      coordinates.forEach(coordinate => acc.extend(coordinate));
    }
    return acc;
  }, new LngLatBounds());
};

export default { bbox };
