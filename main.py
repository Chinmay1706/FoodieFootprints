import plotly.express as px

# Replace 'your_mapbox_token' with your actual Mapbox access token
mapbox_token = 'pk.eyJ1IjoiY2hpbm1heTEyMyIsImEiOiJjbHEzbDlicmYwYWw3MnJwOHlyYW53bTVqIn0.OuhT-knV0smrHBVVJMRMPg'

data = [
    {"lat": 37.7749, "lon": -122.4194, "value": 10},
    {"lat": 34.0522, "lon": -118.2437, "value": 20},
    # Add more data points as needed
]

fig = px.density_mapbox(
    data,
    lat='lat',
    lon='lon',
    z='value',
    radius=10,
    mapbox_style="mapbox/dark",
    center=dict(lat=0, lon=0),
    zoom=0
)

fig.update_layout(mapbox_accesstoken=mapbox_token)
fig.show()

