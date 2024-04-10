
mapboxgl.accessToken =
  "pk.eyJ1IjoiY2hpbm1heTEyMyIsImEiOiJjbHEzbDlicmYwYWw3MnJwOHlyYW53bTVqIn0.OuhT-knV0smrHBVVJMRMPg";

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true
})
let restaurantMap = {};
// lat, lon, density
// restaurantMap['Modern Cafe'] = [73.85131,18.52689, 0];
restaurantMap['Panchali'] = [73.85027,18.52586, 0];
restaurantMap['Surabhi'] = [73.84984,18.52541, 0];
restaurantMap['Gandharva'] = [73.84901,18.52260, 0];
restaurantMap['Manas'] = [73.84954,18.52252, 0];
restaurantMap['Shivsagar'] = [73.84614,18.52021, 0];
restaurantMap['Wadeshwar'] = [73.84168,18.51850, 0];
restaurantMap['Vaishali'] = [73.84121,18.52089, 0];
restaurantMap['Anna'] = [73.84195,18.52267, 0];
restaurantMap['Sandeep'] = [73.84747,18.52300, 0];

allCoordinates = null


densityWeight = 0.1
distanceWeight = 0.9

// Function to handle form submission
function handleSubmit(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Get the value of the range input
  var rangeInputValue = document.getElementById('scrollbar-range').value;

  // Call your function with the range input value
  myFunction(rangeInputValue);
}

// Function to get density value from URL
function getDensityFromURL() {
  var urlParams = new URLSearchParams(window.location.search);
  var density = urlParams.get('density');
  // alert(density)
  // console.log("density " +  density)
  // setTimeout(()=>{},5000)
  return density;
}

function myFunction(value) {

  console.log("Value from myFunction: " + value);

  var densityFromURL = getDensityFromURL();
  console.log("Density from URL: " + densityFromURL);
  return densityFromURL
}

// Call myFunction when the page loads
// window.onload = function() {
function updateDensityDistance(){
  var densityFromURL = getDensityFromURL();
  if (densityFromURL) {
    densityWeight = myFunction(densityFromURL);
    distanceWeight = 1 - densityWeight
  }
};


async function initialiseAllCoordinates(){
  await fetch('./coordinates.json')
  .then((response) => response.json())
  .then((json) => allCoordinates = json);
  return
}

async function getRestaurants(){
  latitudeRange = 0.00096;
  longitudeRange = 0.00080;
   uncounted = 0;
  Object.entries(restaurantMap).forEach(([key, value]) => {
    for(const location of allCoordinates){
        latitudeDiff = Math.abs(value[0] - location['Longitude'] );
        longitudeDiff = Math.abs(value[1] - location['Latitude']);

        if(latitudeDiff <= .00036 && longitudeDiff <= 0.00020){
            restaurantMap[key][2] += 1;
        }else{
          uncounted++;
        }
    }
  });

  Object.entries(restaurantMap).forEach(([key, value]) => {
    console.log(key + " " + value);
  })

}

//Euclidean Distance
// function getDistance(userCoords,restaurantCoords){
//   return Math.sqrt( Math.pow((restaurantCoords[0] - userCoords[0]),2) + Math.pow((restaurantCoords[1] - userCoords[1]),2));
// }

//Manhattan Distance
// function getDistance(userCoords, restaurantCoords) {
//   return Math.abs(restaurantCoords[0] - userCoords[0]) + Math.abs(restaurantCoords[1] - userCoords[1]);
// }

//Haversine Distance
function getDistance(userCoords, restaurantCoords) {
  const R = 6371.0; // Earth's radius in kilometers

  const [lat1, lon1] = userCoords;
  const [lat2, lon2] = restaurantCoords;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// heuristic function
// returns coordinates for the suggested restaurant
function suggestRestaurant(userCoords){


  lon = userCoords[0]
  lat = userCoords[1]
  minimumDistance = Infinity;
  suggestedRestuarant = null;
  Object.entries(restaurantMap).forEach(([key, value]) => {
    restaurantCoords = [value[0],value[1]]  
    curDistance = getDistance(userCoords,restaurantCoords);
    if(curDistance * distanceWeight + value[2] * densityWeight < minimumDistance ){
        minimumDistance = curDistance * distanceWeight + value[2] * densityWeight;
        suggestedRestuarant = key;
        console.log(suggestedRestuarant + " " + minimumDistance)
    }
  })
  return suggestedRestuarant
}

async function successLocation(position) {

  await initialiseAllCoordinates();
  getRestaurants()
  updateDensityDistance()
  userCoords = [position.coords.longitude, position.coords.latitude];
  // userCoords = [78.88221,21.07492];
  suggestedRestuarant = suggestRestaurant(userCoords);
  restaurantCoords = [restaurantMap[suggestedRestuarant][0],restaurantMap[suggestedRestuarant][1]]
  console.log(suggestedRestuarant)
  console.log(restaurantCoords)
  fcCoords = [73.84533,18.52218]
  // uses the suggested restaurant coordinates and current user coordinates and starts a path from current user location to that point
  setupMap(fcCoords,userCoords,restaurantCoords)
}

function errorLocation() {
  setupMap([73.84533,18.52218])
}

function setupMap(center, userCoords, restaurantCoords) {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/traffic-day-v2",
    center: restaurantCoords,
    zoom: 15
  })

  getRoute(userCoords,restaurantCoords)
  const nav = new mapboxgl.NavigationControl()
  map.addControl(nav)
  map.addControl(new mapboxgl.FullscreenControl({container: document.querySelector('body')}));
  var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken
  })

  map.addControl(directions, "top-left")
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
    enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
    }));

// Initialize the GeolocateControl.
const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
      enableHighAccuracy: true
  },
  trackUserLocation: true
});

// Add the control to the map.
map.addControl(geolocate);
// Set an event listener that fires
// when a trackuserlocationend event occurs.
geolocate.on('trackuserlocationend', () => {
  console.log('A trackuserlocationend event has occurred.');
});

map.on('load', () => {
  map.addSource('places', {
      'type': 'geojson',
      'data': {
          'type': 'FeatureCollection',
          'features': [
              {
                  'type': 'Feature',
                  'properties': {
                      'description':
                          '<h3><center>MODERN CAFE PURE VEG</center></h3><img src="https://www.mappls.com/place/5S1S8B_1665556935241_0.jpeg" alt="Modern Cafe Pure Veg" style="max-width:100%;">'
                  },
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [73.85131,18.52689, 0]
                  }
              },
              {
                  'type': 'Feature',
                  'properties': {
                      'description':
                          '<h3><center>HOTEL PANCHALI</center></h3><img src="https://www.mappls.com/place/6XKOWP_1667302440343_0.jpeg" alt="Hotel Panchali" style="max-width:100%;">'
                  },
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [73.85027,18.52586, 0]
                  }
              },
              {
                  'type': 'Feature',
                  'properties': {
                      'description':
                          '<h3><center>SURABHI FAST FOOD</center></h3><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEUpMs4v7Aie3DhRBGgUZ4NhJCVHd769co5g&usqp=CAU" alt="Surabhi Fast Food" style="max-width:100%;">'
                  },
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [73.84984,18.52541, 0]
                  }
              },
              {
                  'type': 'Feature',
                  'properties': {
                      'description':
                          '<h3><center>GANDHARVA PURE VEG</center></h3><img src="https://content.jdmagicbox.com/comp/pune/u8/020pxx20.xx20.140206171337.g5u8/catalogue/hotel-gandharva-pure-veg-family-restaurant-and-party-hall-narhe-gaon-pune-home-delivery-restaurants-1ol2nd.jpg" alt="Gandharva Pure Veg" style="max-width:100%;">'
                  },
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [73.84901,18.52260, 0]
                  }
              },
              {
                  'type': 'Feature',
                  'properties': {
                      'description':
                          '<h3><center>MANAS SATARA</center></h3><img src="https://lh3.googleusercontent.com/6LRQJYuISB7f1VoH8tiuExWDNcK8pc40GWq4r8tFX3NzlBEWvsTpJjkDh38lKGIjqBgEIQq2l9xIY5_mDP072lg_iHM=w256-rw" alt="Hotel Manas Satara" style="max-width:100%;">'
                  },
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [73.84954,18.52252, 0]
                  }
              },
              {
                  'type': 'Feature',
                  'properties': {
                      'description':
                          '<h3><center>SHIVSAGAR VEG RESTAURANT</center></h3><img src="https://media-cdn.tripadvisor.com/media/photo-s/12/eb/f5/cb/shiv-sagar.jpg" alt="Hotel Shivsagar" style="max-width:100%;">'
                  },
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [73.84614,18.52021, 0]
                  }
              },
              {
                  'type': 'Feature',
                  'properties': {
                      'description':
                          '<h3><center>WADESHWAR INDIAN RESTAURANT</center></h3><img src="https://media-cdn.tripadvisor.com/media/photo-s/09/1f/b3/97/wadeshwar.jpg" alt="Hotel Wadeshwar" style="max-width:100%;">'
                  },
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [73.84168,18.51850, 0]
                  }
              },
              {
                  'type': 'Feature',
                  'properties': {
                      'description':
                          '<h3><center>HOTEL VAISHALI</center></h3><img src="https://media-cdn.tripadvisor.com/media/photo-s/04/b7/2d/3c/vaishali.jpg" alt="Hotel Vaishali" style="max-width:100%;">'
                  },
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [73.84121,18.52089, 0]
                  }
              },
              {
                  'type': 'Feature',
                  'properties': {
                      'description':
                          '<h3><center>ANNA<center></h3><img src="https://b.zmtcdn.com/data/pictures/chains/3/18502363/02c362442a5c16ed004f6c69eee6be92_featured_v2.jpg" alt="Hotel Anna" style="max-width:100%;">'
                  },
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [73.84195,18.52267, 0]
                  }
              },
              {
                'type': 'Feature',
                'properties': {
                    'description':
                        '<h3><center>SANDEEP FAMILY RESTAURANT</center></h3><img src="https://www.mappls.com/place/DJJL49_1667276905483_0.jpeg" alt="Hotel Sandeep" style="max-width:100%;">'
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': [73.84747,18.52300, 0]
                }
            }
          ]
      }
  });
  // Add a layer showing the places.
  map.addLayer({
      'id': 'places',
      'type': 'circle',
      'source': 'places',
      'paint': {
          'circle-color': '#4264fb',
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
      }
  });

  // Create a popup, but don't add it to the map yet.
  const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
  });

  map.on('mouseenter', 'places', (e) => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';

      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.description;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(description).addTo(map);
  });

  map.on('mouseleave', 'places', () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
  });
});

map.on('load', () => {
  map.addSource('trees', {
    type: 'geojson',
    data: 'coordinates.geojson'
  });
  // add heatmap layer here
  map.addLayer(
    {
      id: 'trees-heat',
      type: 'heatmap',
      source: 'trees',
      maxzoom: 15,
      paint: {
        // increase weight as diameter breast height increases
        'heatmap-weight': {
          property: 'dbh',
          type: 'exponential',
          stops: [
            [1, 0],
            [62, 1]
          ]
        },
        // increase intensity as zoom level increases
        'heatmap-intensity': {
          stops: [
            [11, 1],
            [15, 3]
          ]
        },
        // assign color values be applied to points depending on their density
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(255, 51, 0,0)',
          0.2,
          'rgba(255, 51, 0,2)',
          0.4,
          'rgba(255, 51, 0,0.4)',
          0.6,
          'rgba(255, 51, 0,0.6)',
          0.8,
          'rgba(255, 51, 0,0.8)'
        ],
        // increase radius as zoom increases
        'heatmap-radius': {
          stops: [
            [11, 15],
            [15, 20]
          ]
        },
        // decrease opacity to transition into the circle layer
        'heatmap-opacity': {
          default: 1,
          stops: [
            [14, 1],
            [15, 0]
          ]
        }
      }
    },
    'waterway-label'
  );

  //   // Add the voice control toggle button to the map
  // map.addControl({
  //   position: 'top-right',
  //   element: voiceControlButton
  // });

  // add circle layer here
  map.addLayer(
    {
      id: 'trees-point',
      type: 'circle',
      source: 'trees',
      minzoom: 14,
      paint: {
        // increase the radius of the circle as the zoom level and dbh value increases
        'circle-radius': {
          property: 'dbh',
          type: 'exponential',
          stops: [
            [{ zoom: 15, value: 1 }, 5],
            [{ zoom: 15, value: 62 }, 10],
            [{ zoom: 22, value: 1 }, 20],
            [{ zoom: 22, value: 62 }, 50]
          ]
        },
        'circle-color': {
          property: 'dbh',
          type: 'exponential',
          stops: [
            [0, 'rgba(255, 51, 0,0)'],
            [10, 'rgba(222,66,61,.15)'],
            [40, 'rgba(222,66,61,.31)'],
            [80, 'rgba(222,66,61,.47)'],
            [120, 'rgba(222,66,61,.62)'],
            [160, 'rgba(222,66,61,.78)'],
            [200, 'rgba(222,66,61,1)']
          ]
        },
        'circle-stroke-color': 'white',
        'circle-stroke-width': 1,
        'circle-opacity': {
          stops: [
            [14, 0],
            [15, 1]
          ]
        }
      }
    },
    'waterway-label'
  );
  });

  async function getRoute(start, end) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change

    // Check if voice control setting is stored in local storage
    // let voiceControlEnabled = localStorage.getItem('voiceControlEnabled') === 'true';

    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route
      }
    };
    
    // if the route already exists on the map, we'll reset it using setData
    if (map.getSource('route')) {
      map.getSource('route').setData(geojson);
    }
    // otherwise, we'll make a new request
    else{
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#0000FF',
          'line-width': 9,
          'line-opacity': 1
        }
      });
      // Add start point marker
      map.addLayer({
        id: 'start-point',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
          type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: start // Start point coordinates
            }
          }
        ]
      }
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#0000FF',
      'circle-stroke-color': '#FFFFFF', // Border color
    'circle-stroke-width': 2 // Border width
    }
  });

  // Add end point marker
  map.addLayer({
    id: 'end-point',
    type: 'circle',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: end // End point coordinates
            }
          }
        ]
      }
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#0000FF',
      'circle-stroke-color': '#FFFFFF', // Border color
    'circle-stroke-width': 2 // Border width
    }
  });

  
  
  // Add a click event listener to the map
  // map.on('click', function(e) {
  //     let start = null;
  //     start = [e.lngLat.lng, e.lngLat.lat];
  //     console.log('Start location selected:', start);

  //     // Once the start location is selected, fetch and display the route to the restaurant
  //     getRoute(start, restaurantCoords);
  // });

// Add turn-by-turn directions control to the map
const directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'mapbox/driving',
    controls: { instructions: true }
});

// map.addControl(directions, 'top-left');

// Set the origin and destination for the directions control
directions.setOrigin(userCoords);
directions.setDestination(restaurantCoords);
// speakDirections(json.routes[0].legs[0].steps);

// if (voiceControlEnabled) {
//   speakDirections(json.routes[0].legs[0].steps);
// }

  // Calculate duration
  const duration = Math.ceil(data.duration / 60); // Convert duration from seconds to minutes


  // Create a popup showing the duration
  new mapboxgl.Popup()
    // .closeButton(false)
    .setLngLat(end)
    .setHTML(`<p>Estimated time: ${duration} minutes</p>`)
    .addTo(map);
  }
    // add turn instructions here at the end
  }

  // function speakDirections(steps) {
  //   const utterances = steps.map(step => new SpeechSynthesisUtterance(step.maneuver.instruction));
  //   utterances.forEach(utterance => {
  //       speechSynthesis.speak(utterance);
  //   });
}


// async function getRoute(start, end) {
//   // make a directions request using driving profile
//   const query = await fetch(
//     `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?alternatives=true&steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
//     { method: 'GET' }
//   );
//   const json = await query.json();
//   // console.log(json); // Log the response from the API
//   // print(json);

//   const routes = json.routes;
//   // console.log(routes); // Log the routes array to check if multiple routes are returned
//   // print(routes);

  
//   // Loop through each route
//   routes.forEach((route, index) => {
//       const routeCoordinates = route.geometry.coordinates;
//       const duration = Math.ceil(route.duration / 60); // Convert duration from seconds to minutes
      
//       // Create a GeoJSON object for the route
//       const geojson = {
//         type: 'Feature',
//         properties: {},
//         geometry: {
//           type: 'LineString',
//           coordinates: routeCoordinates
//         }
//       };

//       // Add the route to the map
//       map.addLayer({
//           id: `route-${index}`,
//           type: 'line',
//           source: {
//               type: 'geojson',
//               data: geojson
//           },
//           layout: {
//               'line-join': 'round',
//               'line-cap': 'round'
//           },
//           paint: {
//               'line-color': '#0000FF',
//               'line-width': 5,
//               'line-opacity': 0.75
//           }
//       });

//       // Calculate the end point of the route
//       const endPoint = routeCoordinates[routeCoordinates.length - 1];

//       // Create a popup showing the duration of the route
//       new mapboxgl.Popup()
//           .setLngLat(endPoint)
//           .setHTML(`<p>Route ${index + 1}: Estimated time: ${duration} minutes</p>`)
//           .addTo(map);
//   });
  
//   // Add start point marker
//   map.addLayer({
//       id: 'start-point',
//       type: 'circle',
//       source: {
//           type: 'geojson',
//           data: {
//               type: 'FeatureCollection',
//               features: [{
//                   type: 'Feature',
//                   geometry: {
//                       type: 'Point',
//                       coordinates: start // Start point coordinates
//                   }
//               }]
//           }
//       },
//       paint: {
//           'circle-radius': 6,
//           'circle-color': '#0000FF',
//           'circle-stroke-color': '#FFFFFF', // Border color
//           'circle-stroke-width': 2 // Border width
//       }
//   });

//   // Add end point marker
//   map.addLayer({
//       id: 'end-point',
//       type: 'circle',
//       source: {
//           type: 'geojson',
//           data: {
//               type: 'FeatureCollection',
//               features: [{
//                   type: 'Feature',
//                   geometry: {
//                       type: 'Point',
//                       coordinates: end // End point coordinates
//                   }
//               }]
//           }
//       },
//       paint: {
//           'circle-radius': 6,
//           'circle-color': '#0000FF',
//           'circle-stroke-color': '#FFFFFF', // Border color
//           'circle-stroke-width': 2 // Border width
//       }
//   });
// }
// }

// document.addEventListener("DOMContentLoaded", async function() {

//   console.log(allCoordinates)
// });


// create a function to make a directions request
