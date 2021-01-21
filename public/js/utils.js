// Set up the map
const SUTD_LAT_LNG = [1.34145, 103.96399];
const map = L.map("map").setView(SUTD_LAT_LNG, 18);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load the modal on page load
$(window).on('load', function () {
    $('#modal .modal-body').html(`
        <p>
            This is a simple demo application showcasing how to use the browser GeoLocation API, along with websockets for live location sharing.
            <br/> <br/>
            Therefore, the locations permission to need to be enabled for the application to function.
            <br/> <br/>
            Your location will <b>not</b> be logged.
        </p>
    `);
    $('#modal').modal('show');
});

// Utility function to change the controls
const updateControls = (roomID, userCount) => {
    $('#controls').html(`
    <h4> Room ID: <a id='room-id'>${roomID}</a> </h4>
    <h4> Room ID: <a id='user-count'>${userCount}</a> users in room</h4>
    `)
}