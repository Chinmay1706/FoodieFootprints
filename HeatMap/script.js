
mapboxgl.accessToken =
  "pk.eyJ1IjoiY2hpbm1heTEyMyIsImEiOiJjbHEzbDlicmYwYWw3MnJwOHlyYW53bTVqIn0.OuhT-knV0smrHBVVJMRMPg"

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true
})
let restaurantMap = {};
// lat, lon, density
restaurantMap['Modern Cafe'] = [73.85131,18.52689, 0];
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

function getDistance(userCoords,restaurantCoords){
  return Math.sqrt( Math.pow((restaurantCoords[0] - userCoords[0]),2) + Math.pow((restaurantCoords[1] - userCoords[1]),2));
}

// heuristic function
// returns coordinates for the suggested restaurant
function suggestRestaurant(userCoords){
      densityWeight = 0.33
      distanceWeight = 0.67

      lon = userCoords[0]
      lat = userCoords[1]
      minimumDistance = Infinity;
      suggestedRestuarant = null;
      Object.entries(restaurantMap).forEach(([key, value]) => {
        restaurantCoords = [value[0],value[1]]  
        curDistance = getDistance(userCoords,restaurantCoords);
        if(curDistance * distanceWeight + value[2] * densityWeight < minimumDistance ){
            minimumDistance = curDistance * distanceWeight + value[2] * densityWeight;
            console.log(suggestedRestuarant)
            suggestedRestuarant = key;
        }
      })
      return suggestedRestuarant
}

async function successLocation(position) {

  await initialiseAllCoordinates();
  getRestaurants()
  userCoords = [position.coords.longitude, position.coords.latitude];
  suggestedRestuarant = suggestRestaurant(userCoords);
  console.log(suggestedRestuarant)
  // uses the suggested restaurant coordinates and current user coordinates and starts a path from current user location to that point
  setupMap([restaurantMap[suggestedRestuarant][0],restaurantMap[suggestedRestuarant][1]])
}

function errorLocation() {
  setupMap([-2.24, 53.48])
}

function setupMap(center) {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: center,
    zoom: 15
  })

  const nav = new mapboxgl.NavigationControl()
  map.addControl(nav)
  map.addControl(new mapboxgl.FullscreenControl({container: document.querySelector('body')}));
  var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken
  })

  map.addControl(directions, "top-left")


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
            [20, 'rgba(222,66,61,.31)'],
            [30, 'rgba(222,66,61,.47)'],
            [40, 'rgba(222,66,61,.62)'],
            [50, 'rgba(222,66,61,.78)'],
            [60, 'rgba(222,66,61,1)']
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
  
}

// document.addEventListener("DOMContentLoaded", async function() {

//   console.log(allCoordinates)
// });