from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

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
    return None

image_path = "/media/chinmay/Data(D)/datasetSingleFolder/1.jpg"
geotag_data = extract_geotagging_data(image_path)
if geotag_data:
    print("Geotagging data:")
    print(geotag_data)
else:
    print("No geotagging data found in the image.")

