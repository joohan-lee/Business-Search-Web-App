function location_chkbox_click(chkbox){
    elem = document.getElementById("input_location")
    if (chkbox.checked){
        elem.value = "";
        elem.setAttribute("disabled", true);
    }else{
        elem.removeAttribute("disabled")
    }
}

/** Clear search form and page */
function clear_all(){
    /** We can easily clear everything and set all default by moving to the original page*/
//    location.href = "/";
    // Form reset
    document.getElementById('search_frm').reset();
    document.getElementById("input_location").removeAttribute("disabled");
    // Remove Business result list
    const parent = document.getElementById('search_result_container');
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
    // Hide detail result (set display as none)
    const detail = document.getElementById('detail_container')
    detail.style.display = 'none';

}

var endPoint = "https://csci571-business-info.wl.r.appspot.com";
//var endPoint = "http://127.0.0.1:8080";

/** For Yelp API, we sent following parameters to Web server.
     1. term(keyword): string
     2. latitude: decimal
     3. longitude: decimal
     4. categories: string, comma delimited
     5. radius(distance): int , maxvalue is 25 miles*/
function submit_search_form(event){
    // prevent reloading
    event.preventDefault()

    var category_map = {
        "Default": "all",
        "Arts & Entertainment": "arts",
        "Health & Medical": "health",
        "Hotels & Travel": "hotelstravel",
        "Food": "food",
        "Professional Services": "professional"
    }
    var term_elem = document.getElementById("input_keyword");
    var term = term_elem.value;
    var latitude;
    var longitude;
    var category_elem = document.getElementById("select_category");
    var category = category_elem.options[category_elem.selectedIndex].value;
    category = category_map[category]
    var radius_elem = document.getElementById("input_distance");
    var radius = radius_elem.value;

    var loc_elem = document.getElementById("input_location");
    var location_input = loc_elem.value;


     // When checkbox is checked, auto-detecting location using ipinfo.io API.
    if (document.getElementById("chk_box").checked){
        var ipinfo_url = "https://ipinfo.io/json?token=";
        var token = "0a6365ed9b2d4b";
        fetch(ipinfo_url + token)
            .then((response) => response.json())
            .then((data) => {
                    console.log(data);
                    var loc = data['loc'].split(',');
                    latitude = loc[0];
                    longitude = loc[1];
                    var latInput = document.createElement("input");
                    var lngInput = document.createElement("input");
                    latInput.setAttribute("type", "hidden");
                    latInput.setAttribute("name", "latitude");
                    latInput.setAttribute("value", latitude);
                    lngInput.setAttribute("type", "hidden");
                    lngInput.setAttribute("name", "longitude");
                    lngInput.setAttribute("value", longitude);

                    var form_elem = document.getElementById("search_frm");

                    form_elem.append(latInput);
                    form_elem.append(lngInput);
                    console.log(form_elem);

                    var url = endPoint + '/search?keyword='+ term +'&distance=' + radius + '&category=' + category+'&latitude='+latitude+'&longitude=' +longitude;
                    searchBusiness(url);

                }
            )
    }
     // When checkbox is not checked, find location(latitude,longitude) using Google Maps Geocoding API.
    else{
        var token = "AIzaSyAOZ1xg2inm8cctEtGz4EqzSEYCA6a8mBE";
        var geocoding_url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+ location_input + '&key=' + token;
        geocoding_url = geocoding_url.replace(" ", "+");
        console.log(geocoding_url);

        fetch(geocoding_url)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data['results'].length == 0){
                    alert('No Geocoding API results with given location, "' + location_input + '". Please try again with another location.');
                    location.reload();
                }
                else{
                    lat = data['results'][0]['geometry']['location']['lat'];
                    lng = data['results'][0]['geometry']['location']['lng'];

                    var latInput = document.createElement("input");
                    var lngInput = document.createElement("input");
                    latInput.setAttribute("type", "hidden");
                    latInput.setAttribute("name", "latitude");
                    latInput.setAttribute("value", lat);
                    lngInput.setAttribute("type", "hidden");
                    lngInput.setAttribute("name", "longitude");
                    lngInput.setAttribute("value", lng);

                    var form_elem = document.getElementById("search_frm");

                    form_elem.append(latInput);
                    form_elem.append(lngInput);
                    console.log(form_elem);

                    var url = endPoint + '/search?keyword='+ term +'&distance=' + radius + '&category=' + category+'&latitude='+lat+'&longitude=' +lng;
                    console.log(url);
                    searchBusiness(url);
                }



            });



    }

}

function httpGetAsync(theUrl, callback){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200)
            callback(xhr.responseText);
    }
    xhr.open("GET", theUrl, true); // true for asynchronous
    xhr.send(null);
}

var searchBusiness = function(url){
    httpGetAsync(url, function(response){
        var response_data = JSON.parse(response);
        console.log(response_data);
        if(response_data["businesses"].length == 0){
            alert('No result. Try again with other inputs.');
            location.href = "/";
        }else{
            buildBusinessTable(response_data);
        }

    });
}

function buildBusinessTable(json_data){
//    var search_result_table = document.getElementById("search_result_table");
//    search_result_table.style.visibility = "visible";

    if (document.getElementById('search_result_table')){
        // If table is already existed, remove it in order to create new one.
        document.getElementById('search_result_table').remove();
    }
    let table = document.createElement('table');
    document.getElementById('search_result_container').appendChild(table);
    table.id = 'search_result_table';

    var insertHead = `
    <tr>
        <th width="50px">No.</th>
        <th width="100px">Image</th>
        <th width="550px" style="cursor:pointer;" onclick="sortTable('str',2);">Business Name</th>
        <th width="150px" style="cursor:pointer;" onclick="sortTable('num',3);">Rating</th>
        <th width="150px" style="cursor:pointer;" onclick="sortTable('num',4);">Distance(miles)</th>
    </tr>`
    $("#search_result_table").append(insertHead);


    businesses = json_data["businesses"]
    n_businesses = businesses.length;


    for(let i = 0; i < n_businesses; i++){
        var insertTr = "";
        insertTr += "<tr>";
        insertTr += `<td>${i+1}</td>`; //No.
        insertTr += `<td><img src=${businesses[i].image_url} alt="img" width="100" height="100"></td>`; //Image
        insertTr += `<td><span class="business_name" id=${businesses[i].id} onclick="showDetail(this);">${businesses[i].name}</span></td>`; //Business Name
        insertTr += `<td>${businesses[i].rating}</td>`; //Rating
        insertTr += `<td>${roundToTwo(businesses[i].distance*0.000621371)}</td>`; //Distance(miles)
        insertTr += "</tr>";

        $("#search_result_table").append(insertTr);

    }

    location.href = "/#search_result_table";


}

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

/** Sort contents of table.
:param: type: string, n: integer
type = {'str', 'num'}, n: {2,3,4} (column number to sort)
*/
function sortTable(type, n){
    var table, rows, switching,i, curr_cell, next_cell, need_switch, direction, switch_cnt=0;

    table = document.getElementById('search_result_table');
    switching = true;
    direction = "asc";

    while(switching){
        switching = false;
        rows = table.getElementsByTagName("tr");
        for (i = 1; i < (rows.length-1); i++){
            need_switch = false;
            curr_cell = rows[i].getElementsByTagName("td")[n];
            next_cell = rows[i+1].getElementsByTagName("td")[n];
            if (direction == "asc"){
            // When sorting ascending order, curr_cell value should be lower than next_cell value
                if((type == "str" && curr_cell.innerText.toLowerCase() > next_cell.innerText.toLowerCase()) ||
                    (type == "num" && Number(curr_cell.innerText) > Number(next_cell.innerText))){
                    need_switch = true;
                    break;
                }
            }else if(direction == "desc"){
            // When sorting ascending order, curr_cell value should be higher than next_cell value
                if((type == "str" && curr_cell.innerText.toLowerCase() < next_cell.innerText.toLowerCase()) ||
                    (type=="num" && Number(curr_cell.innerText) < Number(next_cell.innerText))){
                    need_switch = true;
                    break;
                }
            }
        }

        if(need_switch){
            rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
            switching = true;
            switch_cnt++;
        }else{
            if(switch_cnt==0 && direction=="asc"){
                direction = "desc";
                switching = true;
            }
        }

    }

    // re-numbering
    rows = table.getElementsByTagName("tr");
    // start from index 1 to exclude header
    for(var j=1; j < rows.length; j++){
        rows[j].getElementsByTagName("td")[0].innerText = j;
    }

}

function showDetail(obj){
//    console.log(obj.id);
    var url = endPoint + '/search_detail?business_id='+ obj.id;
    var response_data;
    httpGetAsync(url, function(response){
        response_data = JSON.parse(response);
        console.log(response_data);
        updateDetailCard(response_data);
    });

}

function updateDetailCard(json_data){

    //Business name
    document.getElementById('detail_name').innerText = json_data['name'];
    // Status
    var hours = json_data['hours']
    if(hours == undefined || hours.length == 0){
        document.getElementById('detail_title_status').style.visibility = 'hidden';
        document.getElementById('detail_status').style.visibility = 'hidden';
    }else{
        var is_open_now = json_data['hours'][0]['is_open_now'];
        document.getElementById('detail_title_status').style.visibility = 'visible';
        document.getElementById('detail_status').style.visibility = 'visible';
        if(is_open_now){
            document.getElementById('detail_status').innerText = 'Open Now';
            document.getElementById('detail_status').style.backgroundColor = 'green';
        }else{
            document.getElementById('detail_status').innerText = 'Closed';
            document.getElementById('detail_status').style.backgroundColor = 'red';
        }
    }
    // Category
    var categories = json_data['categories'];
    var str_categories = "";
    for(var i = 0; i < categories.length; i++){
        str_categories += categories[i]['title'];
        if (i < categories.length - 1)  str_categories += " | ";
    }
    if(categories == undefined || categories.length == 0){
        document.getElementById('detail_title_category').style.visibility = 'hidden';
        document.getElementById('detail_category').style.visibility = 'hidden';
    }else{
        document.getElementById('detail_title_category').style.visibility = 'visible';
        document.getElementById('detail_category').style.visibility = 'visible';
        document.getElementById('detail_category').innerText = str_categories;
    }
    // Address
    var address_arr = json_data['location']['display_address'];
    var address_str = address_arr.join(" ");
    if(address_arr == undefined || address_arr.length == 0){
        document.getElementById('detail_title_address').style.visibility = 'hidden';
        document.getElementById('detail_address').innerText = "";
    }else{
        document.getElementById('detail_title_address').style.visibility = 'visible';
        document.getElementById('detail_address').innerText = address_str;
    }
    // Phone Number
    var phone_number = json_data["display_phone"];
    if(phone_number == undefined || phone_number == ""){
        document.getElementById('detail_title_phone').style.visibility = 'hidden';
        document.getElementById('detail_phone').innerText = "";
    }else{
        document.getElementById('detail_title_phone').style.visibility = 'visible';
        document.getElementById('detail_phone').innerText = phone_number;
    }
    // Transactions Supported
    var transactions_arr = json_data["transactions"];
    for(var i = 0; i < transactions_arr.length; i++){
        transactions_arr[i] = transactions_arr[i][0].toUpperCase() + transactions_arr[i].slice(1); //Capitalizing first character.
    }
    var transactions_str = transactions_arr.join(" | ");
    if(transactions_arr == undefined || transactions_arr.length == 0){
        document.getElementById('detail_title_transaction').style.visibility = 'hidden';
        document.getElementById('detail_transaction').innerText = "";
    }else{
        document.getElementById('detail_title_transaction').style.visibility = 'visible';
        document.getElementById('detail_transaction').innerText = transactions_str;
    }

    // Price
    var price = json_data["price"];
    if(price == undefined){
        document.getElementById('detail_title_price').style.visibility = 'hidden';
        document.getElementById('detail_price').innerText = "";
    }else{
        document.getElementById('detail_title_price').style.visibility = 'visible';
        document.getElementById('detail_price').innerText = price;
    }
    //More info
    document.getElementById('detail_link').href = json_data["url"];
    //Photos
    var photos_url_arr = json_data['photos'];
    var n_photos = photos_url_arr.length;
    var photo1;
    var photo2;
    var photo3;
    if(n_photos >= 1){
        document.getElementById('detail_photo1').src = photos_url_arr[0];
    }
    if(n_photos>=2){
        document.getElementById('detail_photo2').src = photos_url_arr[1];
    }
    if(n_photos>=3){
        document.getElementById('detail_photo3').src = photos_url_arr[2];
    }

    $("#detail_container").css('display','grid');
    location.href = "/#detail_card";
}

/** resize the img if it is bigger than container */
function resize(img){
    // Original size
    var width = img.width;
    var height = img.height;

    // set maximum width and height
    var maxWidth = 250;
    var maxHeight = 450;

    // If img is bigger than maximum size
    if(width > maxWidth || height > maxHeight){
      // If width is higher than height, resizes width to maxwidth and resizes height respectively
      if(width > height){
         resizeWidth = maxWidth;
         resizeHeight = Math.round((height * resizeWidth) / width);

      // If height is higher than width.
      }else{
         resizeHeight = maxHeight;
         resizeWidth = Math.round((width * resizeHeight) / height);
      }

    // If img is smaller than maximum size
    }else{
      resizeWidth = width;
      resizeHeight = height;
    }

    // Set img size to resized width and height.
    img.width = resizeWidth;
    img.height = resizeHeight;
}
