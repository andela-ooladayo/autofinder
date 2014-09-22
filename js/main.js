
// FINDER.COM ENTITY

var campusFinder = {
  path:"https://api.foursquare.com/v2/venues/explore?callback?",    
  map:null,
  marker:null,
  currentPosition:null,

  // FINDER.COM INITIALIZING 
  initialize: function() {
    campusFinder.getLocation();   
    $('#enterBox').keyup(campusFinder.initializeSearch);
    $('.result a').click(campusFinder.fetchRecent);
    $('#submit').click(campusFinder.fetchSearch);   
  },
  // FINDER.COM GETTING CURRENT LOCATION
  getLocation: function(){
    $('#map-canvas').html('<img src="image/preloader.GIF" id="preloader">');  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert("Geolocation is not supported by this browser.");
      }
    function showPosition(position) {
      campusFinder.loadMap(position.coords);
      campusFinder.currentPosition = position.coords;
    }
  },
  // FINDER.COM LOADING MAP
  loadMap: function(coordinates){
    directionsDisplay = new google.maps.DirectionsRenderer();
    geocoder = new google.maps.Geocoder();  
    // FINDER.COM map properties
    var mapOptions = {
      zoom: 15,
      center: new google.maps.LatLng(coordinates.latitude,coordinates.longitude),
      mapTypeId:google.maps.MapTypeId.HYBRID,
      panControl:true,
      zoomControl:true,
      mapTypeControl:true,
      scaleControl:true,
      streetViewControl:true,
      overviewMapControl:true,
      rotateControl:true,
    };
    // FINDER.COM creating and displaying map on the page
    campusFinder.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    // FINDER.COM putting marker to indicant the current position and its properties
    campusFinder.marker = new google.maps.Marker({ 
      position: mapOptions.center, 
      animation: google.maps.Animation.BOUNCE
    });
    campusFinder.marker.setMap(campusFinder.map);
    // Zoom to 15 when clicking on marker
    google.maps.event.addListener(campusFinder.marker,'click',function() {
      campusFinder.map.setZoom(15);
      campusFinder.map.setCenter(campusFinder.marker.getPosition());
    });
    google.maps.event.addListener(campusFinder.map,'center_changed',function() {
      window.setTimeout(function() {
        campusFinder.map.panTo(campusFinder.marker.getPosition());
      },40000);
    });
  },
  // FINDER.COM AUTO ADDRESS SEARCHING
  initializeSearch: function() {
    var address = (document.getElementById('enterBox'));
    var autocomplete = new google.maps.places.Autocomplete(address);
    autocomplete.setTypes(['geocode']);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
            return;
      }
      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }
    });
  },
  // FINDER.COM FOURSQUARE API FUNCTIONALTY FOR CURRENT LOCATION
  fetchRecent:function(event){
    $('.outputBox').html('<img src="image/preloader.GIF" id="preloader">');  
    var lat = (campusFinder.currentPosition.latitude);
    var lng = (campusFinder.currentPosition.longitude);
    var LatLng = (lat+", "+lng);
    // console.log(lat);
    // console.log(lng);
    var queryme = $(this).parents().attr('id');
    var para = { 
      client_secret: "QWVA0TKCGU404SQEZGSUMBYWC5FB523KQPRTQWG2K3AXF00H",
      client_id: "CTQUBJ0VCHZS5O405Z0G5SCRCWVECGGJ3QKLTRVSRUG2RI0E",
      ll:LatLng,
      radius:"5000",
      v: "20140707",
      query:queryme,
    }
    campusFinder.callback(para);  
  },
  // FINDER.COM FOURSQUARE API AJAX REQUEST
  callback:function(para){
    $.getJSON(campusFinder.path, para, function(data){
      campusFinder.loadItems(data)
    })

  },

  fetchSearch:function(event){
    event.preventDefault();
    geocoder = new google.maps.Geocoder();
    var address = $('#enterBox').val();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var newLat = results[0].geometry.location.lat();
        var newLng = results[0].geometry.location.lng();    
        var mapOptions = {
          zoom: 5,
          center: new google.maps.LatLng(newLat,newLng),
        }
        campusFinder.marker = new google.maps.Marker({ position: mapOptions.center, animation: google.maps.Animation.BOUNCE});
        campusFinder.marker.setMap(campusFinder.map);
        campusFinder.map.setCenter(campusFinder.marker.getPosition())
        var la = (results[0].geometry.location.lat());
        var lg = (results[0].geometry.location.lng());
        var LaLg = (la+", "+lg);
        // console.log(lat);
        // console.log(lng);
        var queryme = $(this).parents().attr('id');
        var para = { 
          client_secret: "QWVA0TKCGU404SQEZGSUMBYWC5FB523KQPRTQWG2K3AXF00H",
          client_id: "CTQUBJ0VCHZS5O405Z0G5SCRCWVECGGJ3QKLTRVSRUG2RI0E",
          ll:LaLg,
          radius:"50000",
          v: "20140707",
          query:"hotel",
        }
        campusFinder.callback(para);  
      } 
      else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
    google.maps.event.addDomListener(window, 'load', campusFinder.initialize);
  },
  // FINDER.COM FOURSQUARE API RECEIVE REQUEST
  loadItems:function(reply){
    console.log(reply)
    console.log(reply.response.groups[0].name);     
    var content = "";
    $.each(reply.response.groups, function(){
      $.each(this.items, function(){

        content += '<h2 class="nametag">' + this.venue.name + '</h2>'
        if(typeof this.venue.location.address !== "undefined"){
          content += '<p id="address">' + this.venue.location.address + '</p>'
        }
        else{
          content += '<p id="address">' + "Not available" + '</p>'
        };
        if(typeof this.venue.location.crossStreet !== "undefined"){  
          content += '<p id="crossStreet">' + this.venue.location.crossStreet + '</p>'
        }
        else{
          content += '<p id="crossStreet">' + "Not available" + '</p>'
        };
        if(typeof this.venue.location.city !== "undefined"){
        content += '<p id="city">' + this.venue.location.city + '</p>'
        }
        else{
          content += '<p id="city">' + "Not available" + '</p>'
        };          
      })
    }) 
    $('.outputBox').html(content);  
  } 
};
$(document).ready(campusFinder.initialize);
