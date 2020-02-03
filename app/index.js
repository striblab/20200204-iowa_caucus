/**
 * Main JS file for project.
 */

/**
 * Define globals that are added through the js.globals in
 * the config.json file, here, mostly so linting won't get triggered
 * and its a good queue of what is available:
 */
// /* global $, _ */

/**
 * Adding dependencies
 * ---------------------------------
 * Import local ES6 or CommonJS modules like this:
 * import utilsFn from './shared/utils.js';
 *
 * Or import libraries installed with npm like this:
 * import module from 'module';
 */


// Dependencies
import utils from './shared/utils.js';

// DOM loaded
utils.documentReady(() => {
    // Mark page with note about development or staging
    utils.environmentNoting();
});



/**
 * Adding Svelte templates in the client
 * ---------------------------------
 * We can bring in the same Svelte templates that we use
 * to render the HTML into the client for interactivity.  The key
 * part is that we need to have similar data.
 *
 * First, import the template.  This is the main one, and will
 * include any other templates used in the project.
 *
 *   `import Content from '../templates/_index-content.svelte.html';`
 *
 * Get the data parts that are needed.  There are two ways to do this.
 * If you are using the buildData function to get data, then add make
 * sure the config for your data has a `local: "content.json"` property
 *
 *  1. For smaller datasets, just import them like other files.
 *     `import content from '../assets/data/content.json';`
 *  2. For larger data points, utilize window.fetch.
 *     `let content = await (await window.fetch('../assets/data/content.json')).json();`
 *
 * Once you have your data, use it like a Svelte component:
 *
 * utils.documentReady(() => {
 *   const app = new Content({
 *     target: document.querySelector('.article-lcd-body-content'),
 *     hydrate: true,
 *     data: {
 *       content
 *     }
 *   });
 * });
 */



// Common code to get svelte template loaded on the client and hack-ishly
// handle sharing
//
// import Content from '../templates/_index-content.svelte.html';
//
// utils.documentReady(() => {
//   // Deal with share place holder (remove the elements, then re-attach
//   // them in the app component)
//   const attachShare = utils.detachAndAttachElement('.share-placeholder');
//
//   // Main component
//   const app = new Content({
//     target: document.querySelector('.article-lcd-body-content'),
//     hydrate: true,
//     data: {
//       attachShare
//     }
//   });
// });

import Map from './tinymaps.js';

import * as d3 from 'd3';

import iowa from '../sources/iowa_pct_small.json';
// import iowa_all from '../sources/iowa_pct_all.json';


var centerD = [-93.395930, 42.172460];
var zoom1 = 6.3;
var zoom2 = 6.65;
var minzoom = 6.3;

var centerM = [-93.395930, 42.172460];
var zoomM = 5.6;


// const colorScale = d3.scaleOrdinal()
//             .domain(['SANDERS', 'BIDEN', 'KLOBUCHAR', 'WARREN', 'BUTTEGIEG', 'YANG', 'STEYER', 'BLOOMBBERG', 'PATRICK', 'GABBARD', 'BENNET', 'DELANEY'])
//             .range(['#8CBF82','#DEA381','#80ADAD','#7D739C','#F2614C','#636363','##969696','#969696','#969696','#969696','#969696','#969696']);

const candidates = ['SANDERS', 'BIDEN', 'KLOBUCHAR', 'WARREN', 'BUTTEGIEG', 'YANG', 'STEYER', 'BLOOMBBERG', 'PATRICK', 'GABBARD', 'BENNET', 'DELANEY'];

const colors = ['#8CBF82', '#DEA381', '#80ADAD', '#7D739C', '#F2614C', '#636363', '#969696', '#969696', '#969696', '#969696', '#969696', '#969696'];



mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhcnRyaWJ1bmUiLCJhIjoiY2sxYjRnNjdqMGtjOTNjcGY1cHJmZDBoMiJ9.St9lE8qlWR5jIjkPYd3Wqw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/startribune/ck1b7427307bv1dsaq4f8aa5h',
    center: centerD,
    zoom: zoom1,
    // minZoom: minzoom
});



let geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    countries: 'us',
    filter: function(item) {
        return item.context
            .map(function(i) {
                return (
                    i.id.split('.').shift() === 'region' &&
                    i.text === 'Iowa'
                );
            })
            .reduce(function(acc, cur) {
                return acc || cur;
            });
    },
    marker: {
        color: 'gray'
    },
    placeholder: "Search for an address",
    mapboxgl: mapboxgl
});

map.keyboard.disable();
map.scrollZoom.disable();
map.dragPan.disable();
// map.boxZoom.disable();

if (utils.isMobile()) {
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
} else {
    map.getCanvas().style.cursor = 'pointer';
    map.addControl(new mapboxgl.NavigationControl({
        showCompass: false
    }));
}

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));


map.on('load', function() {

    var canvas = map.getCanvasContainer();
    var start;
    var current;
    var box;

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });


    map.addSource('iowa', {
        type: 'geojson',
        data: iowa
    });

    map.addLayer({
        'id': 'iowa-layer1',
        'interactive': true,
        'source': 'iowa',
        'layout': {},
        'type': 'fill',
        'paint': {
            'fill-color': [
                'match',
                ['get', 'results_WINNER'],
                candidates[0],
                colors[0],
                candidates[1],
                colors[1],
                candidates[2],
                colors[2],
                candidates[3],
                colors[3],
                candidates[4],
                colors[4],
                candidates[5],
                colors[5],
                candidates[6],
                colors[6],
                candidates[7],
                colors[7],
                candidates[8],
                colors[8],
                candidates[9],
                colors[9],
                candidates[10],
                colors[10],
                candidates[11],
                colors[11],
                '#ffffff'
            ],
            'fill-opacity': 0.75,
            'fill-antialias': true,
            'fill-outline-color': '#ffffff'
        }
    }, 'settlement-label');


    map.addLayer({
        'id': 'precincts-highlighted1',
        'type': 'fill',
        'source': 'iowa',
        'paint': {
            'fill-outline-color': '#333333',
            'fill-color': 'rgba(0,0,0,0)',
            'fill-opacity': 1
        },
        // 'filter': ['in', 'DISTRICT', '']
    }, 'settlement-label');

    // canvas.addEventListener('mousedown', mouseDown, true);

    // function mousePos(e) {
    //     var rect = canvas.getBoundingClientRect();
    //     return new mapboxgl.Point(
    //         e.clientX - rect.left - canvas.clientLeft,
    //         e.clientY - rect.top - canvas.clientTop
    //     );
    // }

    // function mouseDown(e) {
    //   // Continue the rest of the function if the shiftkey is pressed.
    //   // if (!(e.shiftKey && e.button === 0)) return;

    //     // Disable default drag zooming when the shift key is held down.
    //     map.dragPan.disable();

    //     // Call functions for the following events
    //     document.addEventListener('mousemove', onMouseMove);
    //     document.addEventListener('mouseup', onMouseUp);
    //     document.addEventListener('keydown', onKeyDown);

    //     // Capture the first xy coordinates
    //     start = mousePos(e);
    // }

    // function onMouseMove(e) {
    //     // Capture the ongoing xy coordinates
    //     current = mousePos(e);

    //     // Append the box element if it doesnt exist
    //     if (!box) {
    //         box = document.createElement('div');
    //         box.classList.add('boxdraw');
    //         canvas.appendChild(box);
    //     }

    //     var minX = Math.min(start.x, current.x),
    //         maxX = Math.max(start.x, current.x),
    //         minY = Math.min(start.y, current.y),
    //         maxY = Math.max(start.y, current.y);

    //     // Adjust width and xy position of the box element ongoing
    //     var pos = 'translate(' + minX + 'px,' + minY + 'px)';
    //     box.style.transform = pos;
    //     box.style.WebkitTransform = pos;
    //     box.style.width = maxX - minX + 'px';
    //     box.style.height = maxY - minY + 'px';
    // }

    // function onMouseUp(e) {
    //     // Capture xy coordinates
    //     finish([start, mousePos(e)]);
    // }

    // function onKeyDown(e) {
    //     // If the ESC key is pressed
    //     if (e.keyCode === 27) finish();
    // }

    // function finish(bbox) {
    //     // Remove these events now that finish has been called.
    //     document.removeEventListener('mousemove', onMouseMove);
    //     document.removeEventListener('keydown', onKeyDown);
    //     document.removeEventListener('mouseup', onMouseUp);

    //     if (box) {
    //         box.parentNode.removeChild(box);
    //         box = null;
    //     }

    //     // If bbox exists. use this value as the argument for `queryRenderedFeatures`
    //     if (bbox) {
    //         var features = map.queryRenderedFeatures(bbox, {
    //             layers: ['iowa-layer1']
    //         });

    //         // Run through the selected features and set a filter
    //         // to match features with unique FIPS codes to activate
    //         // the `counties-highlighted` layer.
    //         var filter = features.reduce(
    //             function(memo, feature) {
    //                 memo.push(feature.properties.DISTRICT);
    //                 return memo;
    //             },
    //             ['in', 'DISTRICT']
    //         );

    //         map.setFilter('precincts-highlighted1', filter);
    //     }

    //     map.dragPan.enable();
    // }



    map.on('mousemove', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['precincts-highlighted1']
        });
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

        if (!features.length) {
            popup.remove();
            return;
        }

        var feature = features[0];

        var description = "<div>" + feature.properties.NAME + "</div><div>" + feature.properties.results_WINNER + "</div><div>Total votes: " + d3.format(",")(feature.properties.results_TOTAL_VOTES) + "</div>";

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(e.lngLat)
            .setHTML(description)
            .addTo(map);
    });

});



const map2 = new mapboxgl.Map({
    container: 'map2',
    style: 'mapbox://styles/startribune/ck1b7427307bv1dsaq4f8aa5h',
    center: centerD,
    zoom: zoom2,
    // minZoom: minzoom
});


let geocoder2 = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    countries: 'us',
    filter: function(item) {
        return item.context
            .map(function(i) {
                return (
                    i.id.split('.').shift() === 'region' &&
                    i.text === 'Iowa'
                );
            })
            .reduce(function(acc, cur) {
                return acc || cur;
            });
    },
    marker: {
        color: 'gray'
    },
    placeholder: "Search for an address",
    mapboxgl: mapboxgl
});

map2.keyboard.disable();
map2.scrollZoom.disable();
map2.dragPan.disable();
// map2.boxZoom.disable();

if (utils.isMobile()) {
    map2.dragRotate.disable();
    map2.touchZoomRotate.disableRotation();
} else {
    map2.getCanvas().style.cursor = 'pointer';
    map2.addControl(new mapboxgl.NavigationControl({
        showCompass: false
    }));
}

document.getElementById('geocoder2').appendChild(geocoder2.onAdd(map2));


map2.on('load', function() {

    map2.addSource('iowa', {
        type: 'geojson',
        data: iowa
    });


    map2.addLayer({
        'id': 'iowa-layer2',
        'interactive': true,
        'source': 'iowa',
        'layout': {},
        'type': 'fill',
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'results_KLOBUCHAR_PCT'],
                0,
                '#DAE1E7',
                0.1,
                '#C6D1D9',
                0.2,
                '#A8B9C5',
                0.3,
                '#7F98AA',
                0.4,
                '#556E7F',
                0.5,
                '#2C3942'
            ],
            'fill-opacity': 0.75,
            'fill-antialias': true,
            'fill-outline-color': '#ffffff'
        }
    }, 'settlement-label');


    map2.addLayer({
      'id': 'precincts-highlighted2',
      'type': 'fill',
      'source': 'iowa',
      'paint': {
          'fill-outline-color': '#333333',
          'fill-color': 'rgba(0,0,0,0)',
          'fill-opacity': 1
      },
      // 'filter': ['in', 'DISTRICT', '']
  }, 'settlement-label');



    var popup2 = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map2.on('mousemove', function(e) {
        var features = map2.queryRenderedFeatures(e.point, {
            layers: ['precincts-highlighted2']
        });
        // Change the cursor style as a UI indicator.
        map2.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

        if (!features.length) {
            popup2.remove();
            return;
        }

        var feature = features[0];

        var description = "<div>" + feature.properties.NAME + "</div><div>" + d3.format(".0%")(feature.properties.results_KLOBUCHAR_PCT) + "</div><div>Total votes: " + d3.format(",")(feature.properties.results_TOTAL_VOTES) + "</div>";

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup2.setLngLat(e.lngLat)
            .setHTML(description)
            .addTo(map2);
    });


});



$(document).ready(function() {

    if ($("#mainslide").width() < 520) {
        map.flyTo({
            center: centerM,
            zoom: zoomM,
            minZoom: zoomM
        });
        map2.flyTo({
            center: centerM,
            zoom: zoomM,
            minZoom: zoomM
        });
    } else {
        map.flyTo({
            center: centerD,
            zoom: zoom1,
            minZoom: zoom1
        });
        map2.flyTo({
            center: centerD,
            zoom: zoom2,
            minZoom: zoom2
        });
    }

    $(window).resize(function() {
        if ($("#mainslide").width() < 520) {
            map.flyTo({
                center: centerM,
                zoom: zoomM,
                minZoom: zoomM
            });
            map2.flyTo({
                center: centerM,
                zoom: zoomM,
                minZoom: zoomM
            });
        } else {
            map.flyTo({
                center: centerD,
                zoom: zoom1,
                minZoom: zoom1
            });
            map2.flyTo({
                center: centerD,
                zoom: zoom2,
                minZoom: zoom2
            });
        }
    });

    $(".reset").on("click", function() {
        map.flyTo({
            center: centerD,
            zoom: zoom1
        });
        map2.flyTo({
          center: centerD,
          zoom: zoom2
      });
        $('.mapboxgl-ctrl-geocoder--input').val('');
        $('.mapboxgl-marker').hide();
    });
});


const map0 = new Map("#tinymap0",0);
const map1 = new Map("#tinymap1",1);
const map12 = new Map("#tinymap2",2);
const map3 = new Map("#tinymap3",3);
const map4 = new Map("#tinymap4",4);
const map5 = new Map("#tinymap5",5);
const map6 = new Map("#tinymap6",6);
const map7 = new Map("#tinymap7",7);
const map8 = new Map("#tinymap8",8);
const map9 = new Map("#tinymap9",9);
const map10 = new Map("#tinymap10",10);
const map11 = new Map("#tinymap11",11);

map0.render();
map1.render();
map12.render();
map3.render();
map4.render();
map5.render();
map6.render();
map7.render();
map8.render();
map9.render();
map10.render();
map11.render();