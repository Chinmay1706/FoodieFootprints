import os
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import pandas as pd
import csv
import json

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
        elif 'GPSLatitude' in geotags and 'GPSLongitude'in geotags:
            lat = get_decimal_from_dms(geotags['GPSLatitude'], 'E')
            lon = get_decimal_from_dms(geotags['GPSLongitude'], 'N')
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

def extract_geotagging_data(image_path):
    try:
        img = Image.open(image_path)
        exif_data = img._getexif()
        if exif_data:
            for tag, value in exif_data.items():
                tag_name = TAGS.get(tag, tag)
                if tag_name == 'GPSInfo':
                    gps_info = {}
                    for gps_tag in value:
                        gps_tag_name = GPSTAGS.get(gps_tag, gps_tag)
                        gps_info[gps_tag_name] = value[gps_tag]
                    return gps_info
    except Exception as e:
        print(f"Error: {e}")
        print(image_path)
    return None

print('Selected Dataset Directory...')
print('Initiating image metadata extraction...')
data = []
directory = '/home/chinmay/Pictures/datasetSingleFolder'  # directory containing images
for filename in os.listdir(directory):
    if filename.endswith(".jpg") or filename.endswith(".jpeg"):
        image = Image.open(os.path.join(directory, filename))
        exif = image._getexif()
        try:
            file = os.path.join(directory,filename)
            geotags = extract_geotagging_data(file)
            coordinates = get_coordinates(geotags)
            # print(coordinates)
            if (coordinates != None) :
                data.append([filename, *coordinates])
        except ValueError:
            print(f"No geographic coordinates found for {filename}")
print('Image metadata extracted successfully.')
data.sort()
print('Data sorted successfully...')
write_to_csv('coordinates.csv', data)
print('data converted and stored to coordinates.csv')
def csv_to_json(csv_file_path, json_file_path):
    with open(csv_file_path, 'r') as csv_file:
        csv_reader = csv.DictReader(csv_file)

        data_list = []

        for row in csv_reader:
            data_list.append({
                'Image': row['Image'],
                'Latitude': float(row['Latitude']),
                'Longitude': float(row['Longitude'])
            })

    with open(json_file_path, 'w') as json_file:
        json.dump(data_list, json_file, indent=2)

csv_to_json('coordinates.csv', 'coordinates.json')
print('Data converted to json file successfully.')

            geotags = get_geotagging(exif)
            coordinates = get_coordinates(geotags)
            data.append([filename, *coordinates])
        except ValueError:
            print(f"No geographic coordinates found for {filename}")

write_to_csv('coordinates.csv', data)
