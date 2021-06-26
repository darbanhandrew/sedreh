from datetime import date

import matplotlib.pyplot as plt
from rasterio.plot import show
import ee
import rasterio
import tensorflow as tf
from io import BytesIO
from urllib.request import urlopen
from zipfile import ZipFile
from numpy import savetxt
import simplekml
import numpy as np
from typing import Optional
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, Json

service_account = 'geo-test@geotest-317218.iam.gserviceaccount.com'
credentials = ee.ServiceAccountCredentials(service_account, 'geotest-privkey.json')
ee.Initialize(credentials)


class Order(BaseModel):
    order_id: Optional[int] = None
    start_time: Optional[str] = None
    # geo_json: Optional[Json] = None
    # envelope: Optional[Json] = None

    #


def main(start_time='2019-3-22T00:00:00', geo_json=None, order_id=None, envelope=None):
    # credentials

    scale = 10000
    # set start and end time
    Time_zone = 'Etc/GMT-3'
    enveloped = {}
    time_start = ''
    geoJSON = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [43.40228622016353, 24.238373094311648],
                        [64.05658309516353, 24.238373094311648],
                        [64.05658309516353, 40.33936254411409],
                        [43.40228622016353, 40.33936254411409],
                        [43.40228622016353, 24.238373094311648]
                    ]
                }
            }
        ]
    }
    time_start = ee.Date(start_time, Time_zone)
    time_end = time_start.advance(1, 'day', Time_zone)
    if geo_json:
        geoJSON = geo_json
    if envelope:
        enveloped = envelope
    else:
        enveloped = {"x_min": 43.40228622016353, "x_max": 64.05658309516353, "y_min": 24.238373094311648,
                     "y_max": 40.33936254411409}
    coords = geoJSON['features'][0]['geometry']['coordinates']
    aoi = ee.Geometry.Polygon(coords)
    types = [
        ("COPERNICUS/S5P/NRTI/L3_AER_AI", 'absorbing_aerosol_index', 'aerosol'),
        # ("COPERNICUS/S5P/NRTI/L3_CO", 'CO_column_number_density', 'co'),
        # ("COPERNICUS/S5P/NRTI/L3_HCHO", 'tropospheric_HCHO_column_number_density', 'formaldehyde'),
        # ("COPERNICUS/S5P/OFFL/L3_CH4", 'CH4_column_volume_mixing_ratio_dry_air', 'methane'),
        # ('COPERNICUS/S5P/NRTI/L3_NO2', 'NO2_column_number_density', 'no2'),
        # ("COPERNICUS/S5P/NRTI/L3_O3", 'O3_column_number_density', 'ozone'),
        # ("COPERNICUS/S5P/NRTI/L3_SO2", 'SO2_column_number_density', 'so2')

    ]
    for (address, select, title) in types:
        sentinel_5p_NO2 = (ee.ImageCollection(address).
                           filterBounds(aoi).
                           filterDate(time_start, time_end).
                           select(select).
                           sort('system:time_start').
                           mean().
                           clip(aoi)
                           )

        url = sentinel_5p_NO2.getDownloadURL(
            params={'name': str(order_id) + '_' + start_time + '_' + title, 'scale': scale, 'region': aoi,
                    'crs': 'EPSG:4326', 'filePerBand': False})

        zipurl = url
        with urlopen(zipurl) as zipresp:
            with ZipFile(BytesIO(zipresp.read())) as zfile:
                zfile.extractall('assets/')
        dataset = rasterio.open('assets/' + str(order_id) + '_' + start_time + '_' + title + '.tif')
        dataset_array = dataset.read(1)
        savetxt('csv/' + str(order_id) + '_' + start_time + '_' + title + '.csv', dataset_array, delimiter=',')
        row, column = dataset_array.shape
        print(row, column)
        print(title)
        dataset_array_flat = dataset_array.flatten()
        new_model = tf.keras.models.load_model('my_model.h5')
        predictions = new_model.predict(dataset_array_flat)
        longitude_step = (enveloped["x_max"] - enveloped["x_min"]) / column
        latitude_step = (enveloped["y_max"] - enveloped["y_min"]) / row
        normalized = (predictions - min(predictions)) / (max(predictions) - min(predictions))
        kml = simplekml.Kml()
        for (index, _), normalize in np.ndenumerate(normalized):
            long = (index % column) * longitude_step + enveloped["x_min"]
            lat = enveloped["y_max"] - (int(index / column)) * latitude_step
            name = "Block " + str(index)
            value = normalize
            kml.newpoint(name=name, coords=[(long, lat)], description=str(value))

        kml.save("kml/" + str(order_id) + '_' + start_time + '_' + title + ".kml")
    urlopen("http://app:8000/ordering/confirm-status/?order_id="+str(order_id))
    return str(order_id) + '_' + start_time + '_' + title + ".kml"


app = FastAPI()


@app.post("/check-order/", response_model=Order)
async def check_order(order: Order, background_tasks: BackgroundTasks):
    background_tasks.add_task(main, start_time=order.start_time, order_id=order.order_id)
    return order


@app.get("/check-order/")
async def get_check_order():
    return "Hello"

# @app.get("/items/{item_id}")
# def read_item(item_id: int, q: Optional[str] = None):
#     return {"item_id": item_id, "q": q}

# if __name__ == "__main__":
#     main()
