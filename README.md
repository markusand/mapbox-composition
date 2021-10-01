# Mapbox Composition

Wrapper to use Mapbox GL with Composition API

[![NPM](https://img.shields.io/npm/v/mapbox-composition)](https://npmjs.org/package/mapbox-composition)
[![NPM](https://img.shields.io/bundlephobia/minzip/mapbox-composition)](https://npmjs.org/package/mapbox-composition)
[![NPM](https://img.shields.io/npm/l/mapbox-composition)](https://npmjs.org/package/mapbox-composition)

## Install

```bash
npm i mapbox-gl mapbox-composition
```

## Usage

```javascript
import { onMounted } from 'vue';
import { useMap, useControls, useGeoJSON, useMarker, usePopup } from 'mapbox-composition';

const { MAPBOX_TOKEN } = process.env;

export default {
    name: 'Map',
    setup() {
        onMounted(async () => {
            const map = await useMap('map', {
                accessToken: MAPBOX_TOKEN,
                style: 'mapbox://styles/mapbox/light-v9',
                center: [-122.447303, 37.753574],
                zoom: 12,
            });

            const { addNavigation } = useControls(map);
            addNavigation({ position: 'top-left' });

            useGeoJSON(map, {
                name: 'facilities',
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

### useMap(container, options)

Load a map. This function must be called inside the onMounted hook, after the DOM container has been mounted.

Load is asynchronous, and the function returns a promise that resolves to the Mapbox map instance. Use async/await pattern.

```javascript
onMounted(async () => {
    const map = await useMap('map', { /* Options */ });
});
```

Options object accepts all Mapbox [Map parameters](https://docs.mapbox.com/mapbox-gl-js/api/map/#map-parameters).

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

### useLayer(map, options)

Load one (or many) layers to map. Options require `source` and `layers` attributes, being source any valid style specification [Source](https://docs.mapbox.com/mapbox-gl-js/style-spec/sources) and being every layers object a valid style specification [Layer](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers). Note layer options do not need a `source` attribute as will directly take the source name.

Sources and layers are restored by default after map style changes. To disable this behaviour, set `persist` attribute to false on layer config object.

Options object may include event handlers for source events `onError`, `onLoadStart`, `onLoadEnd` and layer events `onClick` and `onHover`.

```javascript
const layers = useLayer(map, {
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

Use `useGeoJSON(map, options)` as a shortcut for GeoJSON sources that brings enhancements in their management. The `source` attribute can be a GeoJSON url or a GeoJSON object.

The function returns manipulators for layers and source `isVisible(layer_id)`, `setVisibility(isVisible, [,layer_names])`, `setFilters(filters, [,layer_names])`, `clearLayers([layer_names])`, `addLayers(layers)`, `clearSource`, `setSource(source)` and `updateSource(source, [,layers])`. If the layer_names array is not provided, the action will be performed to all layers.

```javascript
const { setVisibility, setFilters, updateSource } = useGeoJSON(map, { /* options */ });
setFilters(['==', ['get', 'type'], 'hospital']);
setVisibility(false, ['layer--1']);
updateSource('http://api.example.com/data/example.geojson');
```

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

If no `content` is provided, a container div is created with the `name` id (must be unique), and more complex layouts can be created using the Vue's [teleport](https://v3.vuejs.org/guide/teleport.html) pattern.

```html
<teleport v-if="showPopup" to="#my-popup">
    <!-- Complex HTML layout -->
</teleport>
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
