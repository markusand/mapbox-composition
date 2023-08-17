# Mapbox Composition

Wrapper to use Mapbox GL with Composition API

[![NPM](https://img.shields.io/npm/v/mapbox-composition)](https://npmjs.org/package/mapbox-composition)
[![NPM](https://img.shields.io/bundlephobia/minzip/mapbox-composition)](https://npmjs.org/package/mapbox-composition)
[![NPM](https://img.shields.io/npm/l/mapbox-composition)](https://npmjs.org/package/mapbox-composition)

## Install

```bash
npm i mapbox-gl mapbox-composition @types/mapbox-gl
```

## Usage

```javascript
import { onMounted } from 'vue';
import { createMap, useControls, useGeoJSON, useMarker, usePopup } from 'mapbox-composition';

const { MAPBOX_TOKEN } = process.env;

export default {
  name: 'Map',
  setup() {
    onMounted(async () => {
      const map = await createMap('map', {
        accessToken: MAPBOX_TOKEN,
        style: 'mapbox://styles/mapbox/light-v9',
        center: [-122.447303, 37.753574],
        zoom: 12,
      });

      const { addNavigation } = useControls(map);
      addNavigation({ position: 'top-left' });

      useGeoJSON(map, {
        id: 'facilities',
        source: 'https://data.sfgov.org/resource/nc68-ngbr.geojson',
        layers: [
          { name: 'markers', type: 'circle', paint: { 'circle-color': '#39f' } },
          { name: 'labels', type: 'symbol', layout: { 'text-field': 'common-name' } },
        ],
      });

      useMarker(map, {
        coordinates: [-122.426498, 37.772496],
        popup: usePopup({ content: 'Painted Ladies' }),
      });
    });

    return {};
  },
};
```

### createMap(container, options)

Load a map. This function must be called inside the onMounted hook, after the DOM container has been mounted.

Load is asynchronous, and the function returns a promise that resolves to the Mapbox map instance. Use async/await pattern.

```javascript
onMounted(async () => {
  const map = await createMap('map', { /* Options */ });
});
```

Options object accepts all Mapbox [Map parameters](https://docs.mapbox.com/mapbox-gl-js/api/map/#map-parameters). Can also include a `controls` attrtbiute with options to automatically initialize controls at map load. Add a debounce parameter to control the resize timing.

Handlers for any [map event](https://docs.mapbox.com/mapbox-gl-js/api/map/#map-events) can be added using the event name prefixed with `on`, such as follows

```javascript
createMap('map', {
  // Many options...
  onZoomend: () => console.log('Zoom End'),
  onDragend: () => console.log('Dragged'),
})
```

### useTerrain(map, options)

> Mapbox-gl v2+ is required to use 3D terrain

Use an extruded 3D map and parametrize the [Sky API options](https://www.mapbox.com/blog/sky-api-atmospheric-scattering-algorithm-for-3d-maps) and [fog options](https://www.mapbox.com/blog/mapbox-gl-js-v2-3-0-distance-fog-elevation-querying-and-terrain-performance-improvements).
Returns `extrude({ exaggeration, pitch })`, `flatten()`, and `isExtruded()` methods.

```javascript
const sky = { /* sky options */ };
const { extrude } = useTerrain(map, { sky });
extrude({ exaggeration: 1.5, pitch: 40 });
```

### useControls(map)

Add map controls.

```javascript
import LegendControl from 'mapboxgl-legend';
const legend = new LegendControl({ /* options */});

const { addControl, removeControl } = useControls(map);
addControl('legend', 'top-left', legend);
removeControl('legend');
```

Shorthands to default [Mapbox controls](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol)
`addNavigation`, `addScale`, `addGeolocate`, `addAttribution`, `addFullscreen` and all remove counterparts. Options object may include `position` and any attribute described in particular control documentation.

```javascript
const { addNavigation, addScale } = useControls(map);
addNavigation();
addScale({ position: 'bottom-right', maxWidth: 150 });
```

A custom `addStyles` control is available to switch between map styles. Switch buttons accept a text label or an image. Styles can be customized via [variables](./src/controls/styles.control.css).

```javascript
const { addStyles } = useControls(map);
addStyles({
  styles: [
    {
      name: 'Mapbox Light',
      url: 'mapbox://styles/mapbox/light-v10',
      label: 'Light',
      // img: '/images/map/thumb.contours.jpg',
    },
    {
      name: 'Mapbox Satellite',
      url: 'mapbox://styles/mapbox/satellite-v9',
      label: 'Satellite',
      // img: '/images/map/thumb.satellite.jpg',
    },
  ]
})
```

A custom `addTerrain` control is available to seamlessly toggle 3D map extrusion.

```javascript
const { addTerrain } = useControls(map);
addTerrain({
  sky: { /* sky options */ },
  exaggeration: 1.5,
  pitch: 40,
  extrudeOnInit: true,
});
```

### useAsync(map)

Use promisified versions of mapbox actions such as `easeTo`, `flyTo`, `fitBounds`, `zoomIn`, etc. and detect its end.

```javascript
const { flyTo } = useAsync(map);
console.log('Going to Berkeley');
await flyTo({ center: [-122.272998, 37.871559] });
console.log('Arrived at Berkeley');
```

### useDataset(map, options)

Load many layers to map. Options accept `source` and `layers` attributes, being source any valid style specification [Source](https://docs.mapbox.com/mapbox-gl-js/style-spec/sources) and being every layers object a valid style specification [Layer](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers). Note layer options do not need a `source` attribute as will directly take the source name.

The `source` parameter accepts a promise to load async data. Additionaly, use the `setSource` method to initialize the data at convenience, for example after a user interaction.

Sources and layers are restored by default after map style changes. To disable this behaviour, set `persist` attribute to false on layer config object.

Layers can be placed under another specific layer by setting the attribute `under` with the name of that layer. This attribute can be global or per layer basis.

Options object may include event handlers for source events `onError`, `onLoadStart`, `onLoadEnd` and layer events `onClick` and `onHover`.

```javascript
const dataset = useDataset(map, {
  name: 'gkhj45665',
  source: {
    type: 'vector',
    url: 'http://api.example.com/tilejson.json',
  },
  layers: [
    { /* Layer options */ },
    { /* Other layer options */ },
  ],
  onClick: ({ features }) => console.log(features),
});
```

The function returns manipulators for layers `isVisible(layer_id)`, `setVisibility(isVisible, [,layer_names])`, `setFilters(filters, [,layer_names])`, `clearLayers([layer_names])`, `updateLayers(layers)`, `addLayers(layers)`, `clearSource`, `setSource(source)`. If the layer_names array is not provided, the action will be performed to all layers.

```javascript
const { setVisibility, setFilters, updateSource } = useGeoJSON(map, { /* options */ });
setFilters(['==', ['get', 'type'], 'hospital']);
setVisibility(false, ['layer--1']);
updateSource('http://api.example.com/data/example.geojson');
```

useDataset does not return an `updateSource(source, [,layers])` method. Use provided helper shortcuts to improve typing and performance, and to modify data afterwards.

```javascript
const geojsonLayer = useGeoJSON(map, /* GeoJSON options */)
const imageLayer = useImage(map, /* Images options */)
const videoLayer = useVideo(map, /* Video options */)
const tilesLayer = useTiles(map, /* Vector or aster tiles options */)
```

This shortcuts also include an `authToken` parameter to set source based authentication with bearer token. Use `updateToken` from the auth returned atribute to refresh expirable tokens such as JWT.

### useMarker(map, options)

Display a marker on the map. Options object accepts any valid [Marker parameters](https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker-parameters) and may include `onDragStart`, `onDrag` and `onDragEnd` event handlers.

The default Mapbox marker is applied unless a specific `element` is defined.

```javascript
const pulseMarker = document.createElement('div');
pulseMarker.classList.add('pulse-marker');

const marker = useMarker(map, {
  element: pulseMarker,
  coordinates: [-122.447303, 37.753574],
  onDragEnd: () => console.log('Marker dragged');
});
```

The function returns a `setLocation` modificator, a getter for the Mapbox marker instance and getter/setter for a popup.

### usePopup([map,] options)

Display a popup on the map. Options object accepts any valid [Popup parameter](https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup-parameters) and may include `onOpen` and `onClose` event handlers.

Use `coordinates` to assign the location of the popup. Popup accepts HTML content with the `content` attribute.

```javascript
const popup = usePopup(map, {
  name: 'my-popup',
  coordinates: [-122.447303, 37.753574],
  content: '<h1>I am a popup</h1>',
  closeOnClick: false,
  onClose: () => console.log('Popup closed'),
});
```

The function returns `setLocation` and `setContent` modificators, and getters for `name` and the Mapbox popup instance.

If no `content` is provided, a container div is created with the `name` id (must be unique), and more complex layouts can be created using patterns like Vue's [teleport](https://v3.vuejs.org/guide/teleport.html).

```html
<Teleport v-if="showPopup" to="#my-popup">
  <!-- Complex HTML layout -->
</Teleport>
```

The `map` attribute is not required when binding popup to a marker, as well as the `coordinates` options parameter.

```javascript
// Add popup on marker creation as a parameter
const marker = useMarker(map, {
  ...OPTIONS,
  popup: usePopup({ content: 'A popup for this marker' }),
})

// Or add popup dynamically
const marker = useMarker(map, OPTIONS);
marker.popup = usePopup({ content: 'A popup for this marker' });
```

### useImages(map)

Load images to be used as icons on the map.

Returns `addImages(images, options)` and `removeImages(images)`. Images are added asynchronously and are not displayed on the map until they are loaded.

Options object accepts `persist` attribute (defaults to true) to reload images after map style changes. Also accepts `sdf`, stretching, and `pixelRatio` [image parameters](https://docs.mapbox.com/mapbox-gl-js/api/map/#addimage-parameters).

```javascript
const images = {
  'my-icon': 'https://example.com/my-icon.png',
  'my-other': 'https://example.com/my-other.png',
};
const { addImages, removeImages } = useImages(map);
await addImages(images, { sdf: true });

removeImages(images);
// or removeImages(['my-icon', 'my-other']);
```

### Helpers

Package exports helper utilities.

At the moment there is only a `bbox` method that receives a a Feature or FeatureCollection and returns its containing bounding box.

## Contribute

Contributions are welcome. Feel free to open a pull request.

By contributing to this project, you agree to license your contributions under the terms of the ISC License.

## License

This package is licensed under the [ISC License](./LICENSE.md)
