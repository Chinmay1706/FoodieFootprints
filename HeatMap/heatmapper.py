import heatmapper

# Input longitudes and latitudes from the user
user_input = input("Enter longitude and latitude pairs (comma-separated, e.g., lon1,lat1;lon2,lat2): ")
user_input = [tuple(map(float, pair.split(','))) for pair in user_input.split(';')]

# Create a list of locations from user input
locations = [(lat, lon) for lon, lat in user_input]

# Create a gmaps figure
fig = heatmapper.figure()

# Create a heatmap layer
heatmap_layer = heatmapper.heatmap_layer(locations)

# Add the heatmap layer to the figure
fig.add_layer(heatmap_layer)

# Show the figure
fig
