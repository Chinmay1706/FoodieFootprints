import os
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import pandas as pd

def get_geotagging(exif):
    if not exif:
        raise ValueError("No EXIF metadata found")

    geotagging = {}
    for (idx, tag) in TAGS.items():
        if tag == 'GPSInfo':
            if idx not in exif:
                raise ValueError("No EXIF geotagging found")

            for (t, value) in GPSTAGS.items():
                if t in exif[idx]:
                    geotagging[value] = exif[idx][t]

    return geotagging

def get_decimal_from_dms(dms, ref):
    degrees = dms[0]
    minutes = dms[1] / 60.0
    seconds = dms[2] / 3600.0

    if ref in ['S', 'W']:
        degrees = -degrees
        minutes = -minutes
        seconds = -seconds

    return round(degrees + minutes + seconds, 5)

# def get_coordinates(geotags):
#     lat = get_decimal_from_dms(geotags['GPSLatitude'], geotags['GPSLatitudeRef'])
#     lon = get_decimal_from_dms(geotags['GPSLongitude'], geotags['GPSLongitudeRef'])

#     return (lat,lon)

def get_coordinates(geotags):
    try:
        # Check if all required keys are present
        if 'GPSLatitude' in geotags and 'GPSLongitude' in geotags and 'GPSLatitudeRef' in geotags and 'GPSLongitudeRef' in geotags:
            lat = get_decimal_from_dms(geotags['GPSLatitude'], geotags['GPSLatitudeRef'])
            lon = get_decimal_from_dms(geotags['GPSLongitude'], geotags['GPSLongitudeRef'])
            return lat, lon
        else:
            print("Missing required geotag information.")
            return None
    except Exception as e:
        print(f"Error extracting coordinates: {e}")
        return None


def write_to_csv(filename, data):
    df = pd.DataFrame(data, columns=['Image', 'Latitude', 'Longitude'])
    df.to_csv(filename, index=False)

data = []
directory = '/home/chinmay/Pictures/datasetSingleFolder'  # directory containing images
for filename in os.listdir(directory):
    if filename.endswith(".jpg") or filename.endswith(".jpeg"):
        image = Image.open(os.path.join(directory, filename))
        exif = image._getexif()
        try:
            geotags = get_geotagging(exif)
            coordinates = get_coordinates(geotags)
            data.append([filename, *coordinates])
        except ValueError:
            print(f"No geographic coordinates found for {filename}")

write_to_csv('coordinates.csv', data)
