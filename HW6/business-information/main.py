# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START gae_python38_app]
# [START gae_python3_app]
from flask import Flask, request, render_template
import requests
import time

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)


@app.route('/')
def index():
    """Main page."""
    return render_template("business.html")

def yelp_request(params: dict):
    """
    Wrapper around the Yelp API including recovering from session failure
    :param params: params parameter for Yelp session request
    :return: raw output
    """
    session = requests.Session()
    url = "https://api.yelp.com/v3/businesses/search"
    header = {'Authorization':'Bearer vno-UMw7n71UB-GHLbHIJq9wTVoEBIXUPCQqVQPVxEJpLqDIw1SRlgAZUr9vtVWa8kddlXV7IA2c-ZQnV8sMGBnys6aQnzrBZXIy27HhIhG5bL0bWVgD20jzhZk-Y3Yx'}
    try:
        data = session.get(url=url, headers=header, params=params)
    except requests.exceptions.ConnectionError:
        time.sleep(2)
        return yelp_request(params)
    return data

def yelp_detail_request(business_id):
    url = "https://api.yelp.com/v3/businesses/" + business_id
    header = {'Authorization':'Bearer vno-UMw7n71UB-GHLbHIJq9wTVoEBIXUPCQqVQPVxEJpLqDIw1SRlgAZUr9vtVWa8kddlXV7IA2c-ZQnV8sMGBnys6aQnzrBZXIy27HhIhG5bL0bWVgD20jzhZk-Y3Yx'}
    data = requests.get(url=url, headers=header)
    return data

@app.route('/search')
def search():
    """
    Get Yelp search result
    :param :
    :return: JSON Yelp result
    """
    # print(request.args)
    keyword = request.args.get('keyword')
    distance = request.args.get('distance')
    distance = int(int(distance) * 1609.344) # radius is in meters, so convert mile into meter. It also accepts only integer.
    if distance > 40000:
        # Yelp API supports maximum 40000 meters distance
        distance = 40000
    category = request.args.get('category')
    location = request.args.get('location')
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')

    params = {
        "term": keyword,
        "latitude": latitude,
        "longitude": longitude,
        "categories": category,
        "radius": distance
    }
    data = yelp_request(params).json()
    # print(data)

    return data

@app.route('/search_detail')
def search_detail():
    """
    Get Yelp business detail
    :param :
    :return: JSON Yelp result
    """
    business_id = request.args.get('business_id')

    data = yelp_detail_request(business_id).json()

    return data




if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. You
    # can configure startup instructions by adding `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [END gae_python3_app]
# [END gae_python38_app]
