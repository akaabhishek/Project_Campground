mapboxgl.accessToken = mapToken;        // THIS mapToken I HAVE ADDED IN A SCRIPT IN SHOW PAGE, BECAUSE ON THAT PAGE I AM REQUIRING THIS FILE AS A SCRIPT AS SINCE THAT FILE WAS .ejs TYPE THEREFORE '<%%>' WILL WORK THERE AND NOT IN THIS FILE
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl()) 

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25})
            .setHTML(
                `<h4>${campground.title}</h4><span><h5>${campground.location}</h5></i></span>`
            )
    )
        
    .addTo(map)