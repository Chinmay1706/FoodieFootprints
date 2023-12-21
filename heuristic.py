def restaurant_heuristic(current_coordinates, restaurant_coordinates, user_density):
    """
    Heuristic function to select a restaurant based on distance and user density.

    Parameters:
    - current_coordinates: Tuple (latitude, longitude) of the user's current location.
    - restaurant_coordinates: Tuple (latitude, longitude) of the restaurant's location.
    - user_density: Number representing the density of users at the restaurant.

    Returns:
    - Heuristic score for the restaurant. Lower scores are better.
    """
    # Define weight factors for distance and user density
    distance_weight = 0.6
    density_weight = 0.4

    # Calculate distance between user and restaurant (you can use Haversine formula)
    distance = calculate_distance(current_coordinates, restaurant_coordinates)

    # Combine distance and user density using the defined weights
    heuristic_score = (distance_weight * distance) + (density_weight * user_density)

    return heuristic_score

def calculate_distance(coord1, coord2):
    """
    Calculate the Haversine distance between two sets of coordinates.

    Parameters:
    - coord1: Tuple (latitude, longitude) of the first location.
    - coord2: Tuple (latitude, longitude) of the second location.

    Returns:
    - Haversine distance between the two locations.
    """
    # Haversine formula for distance calculation
    # (Assuming Earth is a perfect sphere)
    from math import radians, sin, cos, sqrt, atan2

    # Radius of the Earth in kilometers
    R = 6371.0

    lat1, lon1 = radians(coord1[0]), radians(coord1[1])
    lat2, lon2 = radians(coord2[0]), radians(coord2[1])

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = R * c

    return distance
