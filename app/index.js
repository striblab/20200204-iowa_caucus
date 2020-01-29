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

// import Map from './tinymaps.js';

import * as d3 from 'd3';
import Popover from './shared/popover.js';
import StribPopup from './shared/popup.js';

import iowa from '../sources/iowa_pct_small.json';
// import iowa_all from '../sources/iowa_pct_all.json';

const popover_thresh = 500; // The width of the map when tooltips turn to popovers

const isMobile = (window.innerWidth <= popover_thresh || document.body.clientWidth) <= popover_thresh || utils.isMobile();
const adaptive_ratio = utils.isMobile() ? 1.05 : 1.07; // Height/width ratio for adaptive map sizing

// Probably a better way than declaring this up here, but ...
let popover = new Popover('#map-popover');
let center = null;



var centerD = [-93.395930, 42.172460];
var zoom = 6.3;
var minzoom = 6.3;

var centerM = [-93.395930, 42.172460];
var zoomM = 5.6;


// const colorScale = d3.scaleOrdinal()
//             .domain(['SANDERS', 'BIDEN', 'KLOBUCHAR', 'WARREN', 'BUTTEGIEG', 'YANG', 'STEYER', 'BLOOMBBERG', 'PATRICK', 'GABBARD', 'BENNET', 'DELANEY'])
//             .range(['#8CBF82','#DEA381','#80ADAD','#7D739C','#F2614C','#636363','##969696','#969696','#969696','#969696','#969696','#969696']);

const candidates = ['SANDERS', 'BIDEN', 'KLOBUCHAR', 'WARREN', 'BUTTEGIEG', 'YANG', 'STEYER', 'BLOOMBBERG', 'PATRICK', 'GABBARD', 'BENNET', 'DELANEY'];

const colors = ['#8CBF82','#DEA381','#80ADAD','#7D739C','#F2614C','#636363','#969696','#969696','#969696','#969696','#969696','#969696'];



mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhcnRyaWJ1bmUiLCJhIjoiY2sxYjRnNjdqMGtjOTNjcGY1cHJmZDBoMiJ9.St9lE8qlWR5jIjkPYd3Wqw';

const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/startribune/ck1b7427307bv1dsaq4f8aa5h',
center: centerD,
zoom: zoom,
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

if (utils.isMobile()) {
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
  } else {
    map.getCanvas().style.cursor = 'pointer';
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
  }

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));


map.on('load', function() {

    // Prep popup
  let popup = new StribPopup(map);

  // Fastclick-circumventing hack. Awful.
  // https://github.com/mapbox/mapbox-gl-js/issues/2035
  $(map.getCanvas()).addClass('needsclick');

  
map.addSource('iowa', {
    type: 'geojson',
    data: iowa
  });
  
  // This is a layer purely for precinct highlights
  map.addLayer({
    "id": "precincts-highlighted",
    "type": "line",
    "source": "iowa",
    // "source-layer": "iowa",
    "paint": {
      "line-color": "#000000"
    },
      "filter": ['in', 'id', '']
  }, 'settlement-label'); // Place polygon under these labels.

  // Only allow dragpan after you zoom in
  map.on('zoomend', function(e) {
    if (map.getZoom() < 5 ) {
      map.dragPan.disable();
    } else {
      map.dragPan.enable();
    }
  });

  // Capture mousemove events on desktop and touch on mobile or small viewports
  map.on('click', 'iowa', function(e) {
    let f = e.features[0];

    // Highlight precinct on touch
    map.setFilter("precincts-highlighted", ['==', 'id', f.properties.id]);

    if (isMobile) {
      popover.open(f);

      // Scroll into view if popover is off the screen. jQuery assumed to
      // be on page because of Strib environment.
      if (!popover.is_in_viewport()) {
        $('html, body').animate({
          'scrollTop' : $("#map").offset().top
        });
      }

      // Zoom and enhance! But only if you're not already zoomed in past 9
      let zoom = map.getZoom() < 9 ? 9 : map.getZoom();
      map.flyTo({center: e.lngLat, zoom: zoom});
    }

  });

  // Handle mouseover events in desktop and non-mobile viewports
  if (!isMobile) {
    map.on('mousemove', 'iowa', function(e) {
      popup.open(e);
    });

    map.on('mouseleave', 'iowa', function() {
      popup.close();
    });
  }

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
              'fill-antialias' : true,
              'fill-outline-color': '#ffffff'
          }
    }, 'settlement-label');



});



const map2 = new mapboxgl.Map({
  container: 'map2',
  style: 'mapbox://styles/startribune/ck1b7427307bv1dsaq4f8aa5h',
  center: centerD,
  zoom: zoom,
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
  
  map.keyboard.disable();
  map.scrollZoom.disable();
  map.dragPan.disable();
  
  if (utils.isMobile()) {
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();
    } else {
      map.getCanvas().style.cursor = 'pointer';
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
    }
  
  document.getElementById('geocoder2').appendChild(geocoder2.onAdd(map2));
  
  
  map2.on('load', function() {
  
      // Prep popup
    let popup = new StribPopup(map);
  
    // Fastclick-circumventing hack. Awful.
    // https://github.com/mapbox/mapbox-gl-js/issues/2035
    $(map.getCanvas()).addClass('needsclick');
  
    
  map2.addSource('iowa', {
      type: 'geojson',
      data: iowa
    });
    
    // This is a layer purely for precinct highlights
    map2.addLayer({
      "id": "precincts-highlighted",
      "type": "line",
      "source": "iowa",
      // "source-layer": "iowa",
      "paint": {
        "line-color": "#000000"
      },
        "filter": ['in', 'id', '']
    }, 'settlement-label'); // Place polygon under these labels.
  
    // Only allow dragpan after you zoom in
    map2.on('zoomend', function(e) {
      if (map.getZoom() < 5 ) {
        map2.dragPan.disable();
      } else {
        map2.dragPan.enable();
      }
    });
  
    // Capture mousemove events on desktop and touch on mobile or small viewports
    map2.on('click', 'iowa', function(e) {
      let f = e.features[0];
  
      // Highlight precinct on touch
      map2.setFilter("precincts-highlighted", ['==', 'id', f.properties.id]);
  
      if (isMobile) {
        popover.open(f);
  
        // Scroll into view if popover is off the screen. jQuery assumed to
        // be on page because of Strib environment.
        if (!popover.is_in_viewport()) {
          $('html, body').animate({
            'scrollTop' : $("#map").offset().top
          });
        }
  
        // Zoom and enhance! But only if you're not already zoomed in past 9
        let zoom = map2.getZoom() < 9 ? 9 : map2.getZoom();
        map2.flyTo({center: e.lngLat, zoom: zoom});
      }
  
    });
  
    // Handle mouseover events in desktop and non-mobile viewports
    if (!isMobile) {
      map2.on('mousemove', 'iowa', function(e) {
        popup.open(e);
      });
  
      map2.on('mouseleave', 'iowa', function() {
        popup.close();
      });
    }
  
      //   map.addLayer({
      //     'id': 'iowa-layer1',
      //     'interactive': true,
      //     'source': 'iowa',
      //     'layout': {},
      //     'type': 'fill',
      //     'paint': {
      //         'fill-color': [
      //           'match',
      //           ['get', 'results_WINNER'],
      //             candidates[0],
      //             colors[0],
      //             candidates[1],
      //             colors[1],
      //             candidates[2],
      //             colors[2],
      //             candidates[3],
      //             colors[3],
      //             candidates[4],
      //             colors[4],
      //             candidates[5],
      //             colors[5],
      //             candidates[6],
      //             colors[6],
      //             candidates[7],
      //             colors[7],
      //             candidates[8],
      //             colors[8],
      //             candidates[9],
      //             colors[9],
      //             candidates[10],
      //             colors[10],
      //             candidates[11],
      //             colors[11],
      //             '#ffffff'
      //           ],
      //           'fill-opacity': 0.75,
      //           'fill-antialias' : true,
      //           'fill-outline-color': '#ffffff'
      //       }
      // }, 'settlement-label');
  
  
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
              'fill-antialias' : true,
              'fill-outline-color': '#ffffff'
           }
      }, 'settlement-label');
  
  
  
  
  
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
          zoom: zoom,
          minZoom: zoom
      });
      map2.flyTo({
        center: centerD,
        zoom: zoom,
        minZoom: zoom
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
          zoom: zoom,
          minZoom: zoom
      });
      map2.flyTo({
        center: centerD,
        zoom: zoom,
        minZoom: zoom
    });
  }
  });

  $(".reset").on("click", function(){
      map.flyTo({center: centerD, zoom: zoom});
      $('.mapboxgl-ctrl-geocoder--input').val('');
      $('.mapboxgl-marker').hide();
  });
});


// const map0 = new Map("#tinymap0",0);
// const map1 = new Map("#tinymap1",1);
// const map2 = new Map("#tinymap2",2);
// const map3 = new Map("#tinymap3",3);
// const map4 = new Map("#tinymap4",4);
// const map5 = new Map("#tinymap5",5);
// const map6 = new Map("#tinymap6",6);
// const map7 = new Map("#tinymap7",7);
// const map8 = new Map("#tinymap8",8);
// const map9 = new Map("#tinymap9",9);
// const map10 = new Map("#tinymap10",10);
// const map11 = new Map("#tinymap11",11);

// map0.render();
// map1.render();
// map2.render();
// map3.render();
// map4.render();
// map5.render();
// map6.render();
// map7.render();
// map8.render();
// map9.render();
// map10.render();
// map11.render();