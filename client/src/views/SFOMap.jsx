import React, {useRef, useEffect, useState} from 'react';
import axios from 'axios';
import Radium from 'radium';
import { Link  } from '@reach/router';
import GoogleMapReact from 'google-map-react';
import { Map, GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@material-ui/core";
const google = window.google;
let googleMap;


const GoogleMap = ({ placeName }) => {
  console.log('test')
  const googleMapRef = useRef();
  useEffect(() => {
    const googleMapScript = document.createElement("script");
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLEMAPS_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    window.document.body.appendChild(googleMapScript);
    googleMapScript.addEventListener("load", () => {
      googleMap = getLatLng();
    });
    CreateCrimeNamesArray();
  }, []);

  const [crime, setCrime] = useState([]);
  const [crimeSearch, setCrimeSearch] = useState("");
  const [position, setPosition] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [allCrimeData, setAllCrimeData] = useState([]);
  const [allCrimeNames, setAllCrimeNames] = useState([]);
  const [iconV, setIconV] = useState(1);
  const createGoogleMap = (coordinates) => {
    // for (const i=0; i<crime.length; i++){
    //   let lat = 0;
    //   let lng = 0;
      // lat = crime[i].location.latitude;
      // lng = crime[i].location.longitude;
      googleMap = new window.google.maps.Map(googleMapRef.current, {
        zoom: 13,
        center: {
          lat: coordinates.lat(),
          lng: coordinates.lng(),
        },
      //disableDefaultUI: true,
    });
  };

  const createMarker = (markerObj) => new window.google.maps.Marker({
    position: { lat : parseFloat(markerObj.lat), lng : parseFloat(markerObj.lng) },
    map: googleMap,
    zoom: 13,
    label: {
      text: markerObj.title,
      fontSize: "10px",
      style: {
        color: "grey"
      }
      
  },
    icon: {
      url: markerObj.icon,
      // set marker width and height
      scaledSize: new window.google.maps.Size(50, 50)
    }
  });

  //grab the entire object with all the crimes
//use for loop to go through crimes and put in new array
//use new array to setSpecific crime in dropdown menu
//search that specific crime
  // const allCrimeData = (e) => { //captures the array that contains all the crimes
  //   e.preventDefault();
  //   console.log('in all crime data function')
  //   axios.get("https://data.sfgov.org/resource/wg3w-h783.json?incident_year=2018")
  //   .then(res => {
  
  //     setAllCrimeData(res.data); 
      
  //     console.log(res.data);
  //     console.log("******************")
      
  //   })
  //   // console.log(res)
  //   .catch(err=>console.log(err))
  // }

  const CreateCrimeNamesArray = (allCrimeData) => { //creates array containing all crime names

    axios.get("https://data.sfgov.org/resource/wg3w-h783.json?incident_year=2018")
    .then(res => {
  
      setAllCrimeData(res.data); 
      console.log(res.data);
      
      console.log(allCrimeData);
      console.log("******************")
      
    })
    // console.log(res)
    .catch(err=>console.log(err))


    for(let menuCrime of allCrimeData){
      if(allCrimeNames.includes(menuCrime.incident_category) ){
        console.log('this is allCrimeNames' + allCrimeNames);
      }
      else{
        setAllCrimeNames(allCrimeNames.push(menuCrime));
        console.log('this is allCrimeNames' + allCrimeNames);
      }
    }  
  //  }
  console.log(allCrimeData);
  console.log("*****************");
  }

  const SpecificCrime = (e) => {
    console.log('in specific crime function')
    axios.get(` https://data.sfgov.org/resource/wg3w-h783.json?incident_category=${crimeSearch}&$limit=10`)
    .then(res => {
  
      setCrime(res.data); 
      processCrime(res.data);
      console.log(res.data);
      console.log(res.data[0].incident_category);
      console.log("******************")
      console.log('in the specific crime function',crime);
      
    })
    // console.log(res)
    .catch(err=>console.log(err))
  }


  const iconList = {
    icon1: 'https://cdn1.iconfinder.com/data/icons/Map-Markers-Icons-Demo-PNG/256/Map-Marker-Flag--Right-Chartreuse.png',
    icon2: 'https://cdn1.iconfinder.com/data/icons/Map-Markers-Icons-Demo-PNG/256/Map-Marker-Ball-Right-Azure.png',
    icon3: 'https://cdn1.iconfinder.com/data/icons/Map-Markers-Icons-Demo-PNG/256/Map-Marker-Marker-Outside-Pink.png',
    icon4: 'https://cdn2.iconfinder.com/data/icons/IconsLandVistaMapMarkersIconsDemo/256/MapMarker_Marker_Outside_Chartreuse.png',
    icon5: 'https://cdn1.iconfinder.com/data/icons/Map-Markers-Icons-Demo-PNG/256/Map-Marker-Marker-Outside-Orange.png'
  }
  // const icons = (iconList) => {

  //   for(let i = 0; i < iconList.length){
      
  //   }
  // }
  const [markerList, setMarkerList] = useState ([{ lat: 37.74636, lng: -122.391056, icon: iconList.icon1 }]);
  

  const processCrime = (crime) => {
    const copy = [...markerList]
    for (let incident of crime){
      var lat = incident.point.latitude;
      var lng = incident.point.longitude;
      // console.log(lat)
      // console.log(lng);
      console.log('this is copy' + copy);
      var titleV = incident.incident_description;
      var descriptionV = incident.analysis_neighborhood;
      var currentIcon = `icon${iconV}`
      copy.push({lat: parseFloat(lat), lng: parseFloat(lng), title: titleV, description: descriptionV, icon: iconList[currentIcon]})
      iconV<4? setIconV(iconV+1) : setIconV(1);
    }

    // for(let icon of iconList){
    // }

    setMarkerList(copy);
    
    var bounds = new window.google.maps.LatLngBounds();
    copy.map(x => { //SetMarkerList does not get created right away
      console.log(x, "X");

      const marker = createMarker(x);
      console.log(marker);
      bounds.extend(marker.position);
    });
    googleMap.fitBounds(bounds);
    
    
  }
  // const processCrime = (crime) => {
  //   for (let incident of crime){
  //     console.log(crime[0]);
  //     console.log("**************");
  //     var lat = incident.location.latitude;
  //     var lng = incident.location.longitude;
  //     console.log(lng + "lng");
  //     console.log(lat + 'lat');
  //     setPosition(new window.google.maps.LatLng(incident.location.latitude,incident.location.longitude));
  //     const myLatLng = { lat: parseFloat(incident.location.latitude), lng: parseFloat(incident.location.longitude) };
  //     console.log(myLatLng)
  //     new google.maps.Marker({
  //       position: new google.maps.LatLng(incident.location.latitude,incident.location.longitude),
  //       map: googleMap,
  //       animation: google.maps.Animation.DROP,
  //       title: `${incident.cm_legend}`
  //     });
  //   }
  // }

  const getLatLng = () => {
    let lat, lng, placeId;
    return new window.google.maps.Geocoder().geocode(
      { address: `${placeName}` },
      function (results, status) {
        if (status === window.google.maps.GeocoderStatus.OK) {
          placeId = results[0].place_id;
          createGoogleMap(results[0].geometry.location);
          lat = results[0].geometry.location.lat();
          lng = results[0].geometry.location.lng();
          console.log(lat, lng);
          new window.google.maps.Marker({
            position: { lat, lng },
            map: googleMap,
            animation: window.google.maps.Animation.DROP,
            title: `${placeName}`
          });
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      }
    );
  };
  return (
    <div>
      <p style ={{color : "red", marginLeft : "500px"}}>{errorMessage}</p>
      <div style ={{display : "flex", marginTop : "10px"}}>
      <Link to="/LA">
          <button style ={{width : "90px", 
            height: "45px", borderRadius: "2px", 
            color : "white", backgroundImage : "linear-gradient(to right top, #a2adbe, #8c9eb3, #7490a8, #5a829c, #3d7490)", 
            margin : "5px"}}> 
                    <p>Los Angeles</p>
          </button>
        </Link>
        <Link to="/Reading">
          <button style ={{width : "90px", 
          height: "45px", 
          borderRadius: "2px", 
          color : "white", 
          backgroundImage : "linear-gradient(to right top, #a2adbe, #8c9eb3, #7490a8, #5a829c, #3d7490)", 
          margin : "5px"}}>
            Reading
          </button >
        </Link>
        <Link to="/">
          <button style ={{width : "90px", 
          height: "45px", borderRadius: "2px", 
          color : "white", 
          backgroundImage : 'linear-gradient(315deg, #29323c 0%, #485563 74%)',  
          margin : "5px"}}>
            San Francisco
          </button>
        </Link>
        <Link to="/Seattle">
          <button style ={{width : "90px", 
          height: "45px", borderRadius: "2px", 
          color : "white", backgroundImage : "linear-gradient(to right top, #a2adbe, #8c9eb3, #7490a8, #5a829c, #3d7490)", 
          margin : "5px"}}>
            Seattle
          </button>
        </Link>
        {/* <form onSubmit = {SpecificCrime} 
        style ={{
        alignSelf : "center", 
        marginLeft : "150px"
        }}>
            <input type="search" placeholder= "crime type" onChange={e=>setCrimeSearch(e.target.value)}/>
            <input type="submit"/>
        </form> */}
        <FormControl variant='filled' > 
          <InputLabel id="label">Crime Type</InputLabel>
          <Select labelId="label" id="select" value="CrimeType" onChange={(e) => setCrimeSearch(e.target.value)}>
            
            <MenuItem value="CrimeType"></MenuItem>

            {allCrimeNames.map((crimeName, i) => (
              <MenuItem key={i} value="">
                {crimeName}
              </MenuItem>
            ))}
            <MenuItem>
            Also, cheese
            </MenuItem>
          </Select>
        </FormControl>
      </div>
        
      <div
        id="google-map"
        ref={googleMapRef}
        style={{ width: "750px", height: "600px" }}
      />
    </div>
  );
};

export default GoogleMap;