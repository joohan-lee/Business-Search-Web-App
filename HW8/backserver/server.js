const express = require('express')
const path = require("path");
const app = express()
const port = process.env.PORT || 8080;

const router = express.Router()
const axios = require('axios');

const cors = require('cors');

const publicPath = path.join(__dirname, "/dist/business-search");

app.use(cors()); // allow all domaions.
app.use(express.static(publicPath));

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })


async function yelp_request(url, params){
    header = {'Authorization':'Bearer vno-UMw7n71UB-GHLbHIJq9wTVoEBIXUPCQqVQPVxEJpLqDIw1SRlgAZUr9vtVWa8kddlXV7IA2c-ZQnV8sMGBnys6aQnzrBZXIy27HhIhG5bL0bWVgD20jzhZk-Y3Yx'};
    url = url + new URLSearchParams(params);

    // Make a request
    const resp = await axios.get(url, {
        headers:{'Authorization':'Bearer vno-UMw7n71UB-GHLbHIJq9wTVoEBIXUPCQqVQPVxEJpLqDIw1SRlgAZUr9vtVWa8kddlXV7IA2c-ZQnV8sMGBnys6aQnzrBZXIy27HhIhG5bL0bWVgD20jzhZk-Y3Yx'}});

    // return promise to use data from the outside.
    return resp.data;

}

/**This endpoint returns autocomplete suggestions for search keywords, businesses and categories, based on the input text.
documentation: https://www.yelp.com/developers/documentation/v3/autocomplete
*/
app.get('/autocomplete/:text', function (req, res) {
    var params = req.params;

    var url = 'https://api.yelp.com/v3/autocomplete?';

    /* since yelp_request is async function (using axios), I need to use then() to get data.
    The function returns promise. otherwise, it seems response.data returned from yelp_request is undefined
    Once yelp_request execution is done, then() is called.*/
    yelp_request(url, params).then(data => {
        // console.log(data);
        res.send(data);
    })
    .catch(err => { console.log(err)});
    
})

/**
 * This endpoint returns Response with latitude and longitude, based on the given location.
  documentation: https://developers.google.com/maps/documentation/geocoding/start
 */
app.get('/geocoding/:location', function(req, res){
  var location = req.params.location;
  var token = ""; // fill your google api key here
  var geocoding_url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+ location + '&key=' + token;
  geocoding_url = geocoding_url.replace(" ", "+");

  axios.get(geocoding_url)
  .then(function (response) {
    // handle success
    res.send(response['data'])
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });

})

/**
 * This endpoint, 'search', returns business information.
 * documentation: https://www.yelp.com/developers/documentation/v3/business_search
 */
app.get('/searchBusiness',function(req, res){
  /** For Yelp API, we sent following parameters to Web server.
     1. term(keyword): string
     2. latitude: decimal
     3. longitude: decimal
     4. categories: string, comma delimited
     5. radius(distance): int , maxvalue is 25 miles
     6. limit: int, Number of business results to return. */
  var url = 'https://api.yelp.com/v3/businesses/search?';

  yelp_request(url, req.query).then(data => {
    res.send(data);
    }).catch(err => { console.log(err)});
})

/**This endpoint, 'businessDetail, returns detailed information of business.
 * Search by business id.
 * documentation: https://www.yelp.com/developers/documentation/v3/business
  */
app.get('/businessDetail/:business_id', function(req,res){
  var url = 'https://api.yelp.com/v3/businesses/' + req.params.business_id;
  var params = {
    id: req.params.business_id
  }
  var detailed_data;
  const resp = axios.get(url, {
    headers:{'Authorization':'Bearer vno-UMw7n71UB-GHLbHIJq9wTVoEBIXUPCQqVQPVxEJpLqDIw1SRlgAZUr9vtVWa8kddlXV7IA2c-ZQnV8sMGBnys6aQnzrBZXIy27HhIhG5bL0bWVgD20jzhZk-Y3Yx'}
  }).then(function(response){
    detailed_data = response['data'];
    res.send(detailed_data);
    return detailed_data;
  }).catch(function (error) {
    // handle error
    console.log(error);
  });
})

/**This endpoint, 'reviewDetail', returns up to 3 reviews of this business.
 * Search by business id.
 * yelp api: GET https://api.yelp.com/v3/businesses/{id}/reviews
 * documentation: https://www.yelp.com/developers/documentation/v3/business_reviews
 */
app.get('/reviewDetail/:business_id',function(req,res){
  var url = 'https://api.yelp.com/v3/businesses/' + req.params.business_id + "/reviews";
  var detailed_data;
  const resp = axios.get(url, {
    headers:{'Authorization':'Bearer vno-UMw7n71UB-GHLbHIJq9wTVoEBIXUPCQqVQPVxEJpLqDIw1SRlgAZUr9vtVWa8kddlXV7IA2c-ZQnV8sMGBnys6aQnzrBZXIy27HhIhG5bL0bWVgD20jzhZk-Y3Yx'}
  }).then(function(response){
    detailed_data = response['data'];
    res.send(detailed_data);
    return detailed_data;
  }).catch(function (error) {
    // handle error
    console.log(error);
  });
})



app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname + "/dist/business-search/index.html"));
});

// //The 404 Route (ALWAYS Keep this as the last route). should be defined(declared) last place.
// app.get('*', function(req, res){
//   res.redirect('/');
// });

// Listen to the App Engine-specified port, or 3000 otherwise
app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
