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



import Map from './tinymaps.js';
import iowa from '../sources/iowa_pct_small.json';


var centerD = [-93.395930, 42.172460];
var zoom1 = 6.3;
var zoom2 = 6.65;


var centerM = [-93.395930, 42.172460];
var zoomM = 5.6;


if ($("#mainslide").width() < 520) {
    var minzoom1 = zoomM;
    var minzoom2 = zoomM;
} else {
    var minzoom1 = zoom1;
    var minzoom2 = zoom2;
}

// const colorScale = d3.scaleOrdinal()
//             .domain(['SANDERS', 'BIDEN', 'KLOBUCHAR', 'WARREN', 'BUTTEGIEG', 'YANG', 'STEYER', 'BLOOMBBERG', 'PATRICK', 'GABBARD', 'BENNET', 'DELANEY'])
//             .range(['#8CBF82','#DEA381','#80ADAD','#7D739C','#F2614C','#636363','##969696','#969696','#969696','#969696','#969696','#969696']);

const candidates = ['SANDERS', 'BIDEN', 'KLOBUCHAR', 'WARREN', 'BUTTIGIEG', 'YANG', 'STEYER', 'BLOOMBERG', 'PATRICK', 'GABBARD', 'BENNET', 'TIED'];

const colors = ['#8CBF82','#415B46','#80ADAD','#7D739C','#379B9B','#252525','#252525','#969696','#969696','#969696','#969696','#F7F7F7'];



mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhcnRyaWJ1bmUiLCJhIjoiY2sxYjRnNjdqMGtjOTNjcGY1cHJmZDBoMiJ9.St9lE8qlWR5jIjkPYd3Wqw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/startribune/ck1b7427307bv1dsaq4f8aa5h',
    center: centerD,
    zoom: zoom1,
    minZoom: minzoom1
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
// map.dragPan.disable();
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
            'fill-outline-color': '#333333'
        }
    }, 'settlement-label');

// if ($("#mainslide").width() > 520) {
//     map.addLayer({
//         'id': 'precincts-highlighted1',
//         'type': 'fill',
//         'source': 'iowa',
//         'paint': {
//             'fill-outline-color': '#333333',
//             'fill-color': 'rgba(0,0,0,0)',
//             'fill-opacity': 1
//         },
//         // 'filter': ['in', 'DISTRICT', '']
//     }, 'settlement-label');

//     map.on('mousemove', function(e) {
//         var features = map.queryRenderedFeatures(e.point, {
//             layers: ['precincts-highlighted1']
//         });
//         // Change the cursor style as a UI indicator.
//         map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

//         if (!features.length) {
//             popup.remove();
//             return;
//         }

//         var feature = features[0];

//         var description = "<div class='tipmame'>" + feature.properties.NAME + "</div> \
//         <div class='line'> \
//             <div class='type'>" + feature.properties.results_WINNER + "</div>\
//             <div class='num'>" + d3.format(".0%")(feature.properties.results_WINNER_PCT) + "</div> \
//         </div> \
//         <div class='line'> \
//             <div class='type'>Total</div>\
//             <div class='num'>" + d3.format(",")(feature.properties.results_TOTAL_VOTES) + "</div> \
//         </div>";

//         // Populate the popup and set its coordinates
//         // based on the feature found.
//         popup.setLngLat(e.lngLat)
//             .setHTML(description)
//             .addTo(map);
//     });
// }

});



const map2 = new mapboxgl.Map({
    container: 'map2',
    style: 'mapbox://styles/startribune/ck1b7427307bv1dsaq4f8aa5h',
    center: centerD,
    zoom: zoom2,
    minZoom: minzoom2
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
// map2.dragPan.disable();
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
                ['get', 'results_KLOBUCHAR'],
                0,
                '#ffffff',
                0.2,
                '#DAE1E7',
                0.4,
                '#C6D1D9',
                0.6,
                '#A8B9C5',
                0.8,
                '#7F98AA',
                1,
                '#556E7F',
                1.1,
                '#2C3942'
            ],
            'fill-opacity': 0.75,
            'fill-antialias': true,
            'fill-outline-color': '#333333'
        }
    }, 'settlement-label');


// if ($("#mainslide").width() > 520) {
//     map2.addLayer({
//       'id': 'precincts-highlighted2',
//       'type': 'fill',
//       'source': 'iowa',
//       'paint': {
//           'fill-outline-color': '#333333',
//           'fill-color': 'rgba(0,0,0,0)',
//           'fill-opacity': 1
//       },
//       // 'filter': ['in', 'DISTRICT', '']
//   }, 'settlement-label');



//     var popup2 = new mapboxgl.Popup({
//       closeButton: false,
//       closeOnClick: false
//     });

//     map2.on('mousemove', function(e) {
//         var features = map2.queryRenderedFeatures(e.point, {
//             layers: ['precincts-highlighted2']
//         });
//         // Change the cursor style as a UI indicator.
//         map2.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

//         if (!features.length) {
//             popup2.remove();
//             return;
//         }

//         var feature = features[0];

//         var description = "<div class='tipmame'>" + feature.properties.NAME + "</div> \
//         <div class='line'> \
//             <div class='type'>Klobuchar</div>\
//             <div class='num'>" + d3.format(".0%")(feature.properties.results_KLOBUCHAR_PCT) + "</div> \
//         </div> \
//         <div class='line'> \
//             <div class='type'>Total</div>\
//             <div class='num'>" + d3.format(",")(feature.properties.results_TOTAL_VOTES) + "</div> \
//         </div>";

//         // Populate the popup and set its coordinates
//         // based on the feature found.
//         popup2.setLngLat(e.lngLat)
//             .setHTML(description)
//             .addTo(map2);
//     });
// }


});



$(document).ready(function() {

    if ($("#mainslide").width() < 520) {
        map.flyTo({
            center: centerM,
            zoom: zoomM,
        });
        map2.flyTo({
            center: centerM,
            zoom: zoomM,
        });
    } else {
        map.flyTo({
            center: centerD,
            zoom: zoom1,
        });
        map2.flyTo({
            center: centerD,
            zoom: zoom2,
        });
    }

    $(window).resize(function() {
        if ($("#mainslide").width() < 520) {
            map.flyTo({
                center: centerM,
                zoom: zoomM,
            });
            map2.flyTo({
                center: centerM,
                zoom: zoomM,
            });
        } else {
            map.flyTo({
                center: centerD,
                zoom: zoom1,
            });
            map2.flyTo({
                center: centerD,
                zoom: zoom2,
            });
        }
    });

    $(".reset").on("click", function() {
        map.flyTo({
            center: centerD,
            zoom: minzoom1
        });
        map2.flyTo({
          center: centerD,
          zoom: minzoom2
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