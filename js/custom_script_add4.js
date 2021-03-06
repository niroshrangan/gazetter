var country_boundary;
var cityFieldGroup;

var mymap = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(mymap);

        mymap.zoomControl.setPosition("topright");

        country_boundary = new L.geoJson().addTo(mymap);

//////////
var redMarker = L.icon({
    iconUrl: 'img/marker-icon-2x-red.png',
	shadowUrl: 'img/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [0, 0],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});
L.marker([51.505, -0.09], {icon: redMarker}).addTo(mymap);
/////////

function getCountryCodes() {
  $.ajax({
    url: "php/getCountryCode.php?",
    type: "GET",
    success: function (result) {
      var countries = JSON.parse(result);
      var option = "";
      for (country of countries) {
        option +=
          '<option value="' + country[1] + '">' + country[0] + "</option>";
      }
      $("#country_list").append(option);
    },
  });
}

function getUserCoords() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        mymap.spin(true);
        $.ajax({
          url: "php/getUserCoords.php?",
          data: {
            lat: lat,
            lng: lng
          },
          type: "GET",
          success: function (result) {
            mymap.spin(false);
            output = JSON.parse(result); // Parse the string data to JavaScript object
            // console.log(json);
            var country_code = output.countryCode;
            $("#country_list").val(country_code).trigger("change");
          },
        });
      },
      function () {
        alert("Could not get your position!");
      }
    );
  }
}

getCountryCodes();
getUserCoords();

function getBorders(country_code) {
  $.ajax({
    url: "php/getBorders.php",
    type: "GET",
    data: {
      country_code: country_code
    },
    success: function (result) {
      var output = JSON.parse(result);
      country_boundary.clearLayers();
      country_boundary.addData(output).setStyle({fillColor: "red",
      weight: 1,
      opacity: 0.1,
      color: "white", //Outline color
      fillOpacity: 0.6,});
      var bounds = country_boundary.getBounds();
      mymap.fitBounds(bounds);

      var east = bounds.getEast();
      var west = bounds.getWest();
      var north = bounds.getNorth();
      var south = bounds.getSouth();
      showCityMarkers(north, south, east, west);
    },
  });
}

function showCityMarkers(northCoords, southCoords, eastCoords, westCoords) {
    cityFieldGroup.clearLayers();
    $.ajax({
        url: "php/getCityMarker.php",
        data: {
            northCoords: northCoords,
            southCoords: southCoords,
            eastCoords: eastCoords,
            westCoords: westCoords
        },
        type: "GET",
        success: function(result) {
            var results = $.parseJSON(result);
            var cityData = results.geonames;
            var cityMarker = L.icon({
                iconUrl: 'img/marker-icon-2x-red.png',
                shadowUrl: 'img/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [0, 0],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            for (var i = 0; i < cityData.length; i++) {
                var mapMarker = L.marker([cityData[i].lat, cityData[i].lng], {
                    icon: cityMarker,
                }).bindPopup(
                    "<b>" + 
                    cityData[i].name +
                    "</b><br>Population: " +
                    parseInt(cityData[i].population).toLocaleString("en")
                    );
                    cityFieldGroup.addLayer(mapMarker);
            }
        }
    })
}

function zoomToCountry(country_code) {
  if (country_code == "") return;
  country_name = $("#country_list option:selected").text();
  getBorder(country_code);
  getCountryInfo(country_code);
  show_popup();
  mymap.spin(false);
}

function getCountryInfo(country_code) {
  if ($("#country_info").css("left") !== "5px") {
    $("#country_info").animate({
      left: "5px"
    }, 1000);
    $(".pull_country_info_popup").animate({
      left: "-40px"
    }, 1000);
  }
  mymap.spin(true, {
    top: 180,
    left: 150
  });

  $.ajax({
    url: "php/getCountryInfo.php",
    type: "GET",
    data: {
      country_code: country_code
    },
    success: function (result) {
      mymap.spin(false);
      var details = $.parseJSON(result);
      console.log(details);
      var lat = details.latlng[0];
      var lng = details.latlng[1];
      var capitalCity = details.capital;
      $("#country_name").html(details.name);
      $("#country_name2").html(details.name);
      $("#country_capital").html(capitalCity);
      $("#country_capital2").html(capitalCity);
      $("#country_population").html(details.population);
      $("#country_area").html(details.area);
      $("#country_flag").attr("src", details.flag);
      $("#country_currency").html(details.currencies[0]["name"]);
      $("#currency_symbol").html(details.currencies[0]["symbol"]);
      $("#country_language").html(details.languages[0]["name"]);
      $("#country_wikipedia").attr(
        "href",
        "https://en.wikipedia.org/wiki/" + details.name
      );
    //   $("#cCode").html(details.alpha2Code);
    getCityInfo(details.capital);
    getNews(details.name);
    getWeather(lat, lng);
    }
  });
}

function getCityInfo(capitalCity) {
    mymap.spin(true);
    $.ajax({
        url: "php/getCityInfo.php",
        type: "GET",
        data: {
            capitalCity: capitalCity
        },
        success: function(result) {
            mymap.spin(false);
            var cityInfo = $.parseJSON(result);
            console.log(cityInfo);
            $("#cityInfo").html(cityInfo);
        }
    })
}

function getNews(countryName) {
    $.ajax({
        url: "php/getNews.php",
        type: "GET",
        data: {
            countryName: countryName
        },
        success: function(result) {
            var newsData = $.parseJSON(result);
            //var articles = newsData[0][0];
            $("#articleTitle1").html(newsData[0][0]);
            $("#articleTitle2").html(newsData[1][0]);
            $("#articleTitle3").html(newsData[2][0]);
            $("#articleTitle4").html(newsData[3][0]);
            //link
            $(".link1").attr("href", newsData[0][1]);
            $(".link2").attr("href", newsData[1][1]);
            $(".link3").attr("href", newsData[2][1]);
            $(".link4").attr("href", newsData[3][1]);
            //images
            $("#atricleImg1").attr("src", newsData[0][2]);
            $("#atricleImg2").attr("src", newsData[1][2]);
            $("#atricleImg3").attr("src", newsData[2][2]);
            $("#atricleImg4").attr("src", newsData[3][2]);
        }
    })
}

function getWeather(lat, lng) {
    $.ajax({
        url: "php/getWeather.php",
        type: "GET",
        data: {
            lat: lat,
            lng: lng
        },
        success: function(result) {
            var weatherData = $.parseJSON(result);
            // location
            $("#weather_city_name").html(weatherData.timezone);
            // icon
            $("#mainImg").attr("src", "https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" + weatherData["daily"][0]['weather'][0]['icon'] + ".svg");
            // today's high and low
            $("#mainHigh").html("High: " + (Math.round(weatherData["daily"][0]["temp"]["max"])) + "&deg;C");
            $("#mainLow").html("Low: " + (Math.round(weatherData["daily"][0]["temp"]["min"])) + "&deg;C");
            var daysArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            // day row
            $("#today").html(daysArray[new Date(weatherData["daily"][0]["dt"] * 1000).getDay()]);
            $("#today1").html(daysArray[new Date(weatherData["daily"][1]["dt"] * 1000).getDay()]);
            $("#today2").html(daysArray[new Date(weatherData["daily"][2]["dt"] * 1000).getDay()]);
            $("#today3").html(daysArray[new Date(weatherData["daily"][3]["dt"] * 1000).getDay()]);
            $("#today4").html(daysArray[new Date(weatherData["daily"][4]["dt"] * 1000).getDay()]);
            $("#today5").html(daysArray[new Date(weatherData["daily"][5]["dt"] * 1000).getDay()]);
            $("#today6").html(daysArray[new Date(weatherData["daily"][6]["dt"] * 1000).getDay()]);
            // condition row
            $("#smallImg1").attr("src", "https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" + weatherData["daily"][0]['weather'][0]['icon'] + ".svg");
            $("#smallImg2").attr("src", "https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" + weatherData["daily"][1]['weather'][0]['icon'] + ".svg");
            $("#smallImg3").attr("src", "https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" + weatherData["daily"][2]['weather'][0]['icon'] + ".svg");
            $("#smallImg4").attr("src", "https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" + weatherData["daily"][3]['weather'][0]['icon'] + ".svg");
            $("#smallImg5").attr("src", "https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" + weatherData["daily"][4]['weather'][0]['icon'] + ".svg");
            $("#smallImg6").attr("src", "https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" + weatherData["daily"][5]['weather'][0]['icon'] + ".svg");
            $("#smallImg7").attr("src", "https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" + weatherData["daily"][6]['weather'][0]['icon'] + ".svg");
            // high row
            $("#highToday").html((Math.round(weatherData["daily"][0]["temp"]["max"])) + "&deg;C");
            $("#highToday1").html((Math.round(weatherData["daily"][1]["temp"]["max"])) + "&deg;C");
            $("#highToday2").html((Math.round(weatherData["daily"][2]["temp"]["max"])) + "&deg;C");
            $("#highToday3").html((Math.round(weatherData["daily"][3]["temp"]["max"])) + "&deg;C");
            $("#highToday4").html((Math.round(weatherData["daily"][4]["temp"]["max"])) + "&deg;C");
            $("#highToday5").html((Math.round(weatherData["daily"][5]["temp"]["max"])) + "&deg;C");
            $("#highToday6").html((Math.round(weatherData["daily"][6]["temp"]["max"])) + "&deg;C");
            // low row
            $("#lowToday").html((Math.round(weatherData["daily"][0]["temp"]["min"])) + "&deg;C");
            $("#lowToday1").html((Math.round(weatherData["daily"][1]["temp"]["min"])) + "&deg;C");
            $("#lowToday2").html((Math.round(weatherData["daily"][2]["temp"]["min"])) + "&deg;C");
            $("#lowToday3").html((Math.round(weatherData["daily"][3]["temp"]["min"])) + "&deg;C");
            $("#lowToday4").html((Math.round(weatherData["daily"][4]["temp"]["min"])) + "&deg;C");
            $("#lowToday5").html((Math.round(weatherData["daily"][5]["temp"]["min"])) + "&deg;C");
            $("#lowToday6").html((Math.round(weatherData["daily"][6]["temp"]["min"])) + "&deg;C");
            // precipitation row
            $("#preToday").html((Math.round(weatherData["daily"][0]['pop'] * 100)) + "%");
            $("#preToday1").html((Math.round(weatherData["daily"][1]['pop'] * 100)) + "%");
            $("#preToday2").html((Math.round(weatherData["daily"][2]['pop'] * 100)) + "%");
            $("#preToday3").html((Math.round(weatherData["daily"][3]['pop'] * 100)) + "%");
            $("#preToday4").html((Math.round(weatherData["daily"][4]['pop'] * 100)) + "%");
            $("#preToday5").html((Math.round(weatherData["daily"][5]['pop'] * 100)) + "%");
            $("#preToday6").html((Math.round(weatherData["daily"][6]['pop'] * 100)) + "%");
        }
    })
}

function show_popup() {
  $("#bs").animate({
      left: "520px"
      }, 1000);
        
  $("#showButton").animate({
      left: "-540px"
      }, 1000);
}
        
function hide_popup() {
  $("#bs").animate({
      left: "-520px"
  }, 1000);
        
  $("#showButton").animate({
      left: "-490px"
  }, 1000);
}
