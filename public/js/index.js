// Set up websocket connection
const HOST = window.location.host;
const WS_URL = window.location.protocol == "https:" ? `wss://${HOST}/` : `ws://${HOST}/`;
const ws = new WebSocket(WS_URL);

const myRoom = {
    active: false,
    id: "",
    users: [],
}

const myUser = {
    id: "",
    name: "",
    lat: null,
    lng: null,
    marker: L.marker(SUTD_LAT_LNG)
        .bindTooltip("<b>you</b>", { permanent: true })
        .addTo(map),
}

navigator.geolocation.watchPosition((g) => {
    myUser.lat = g.coords.latitude;
    myUser.lng = g.coords.longitude;

    myUser.marker.setLatLng([myUser.lat, myUser.lng]);
    map.setView([myUser.lat, myUser.lng]);

    if (myRoom.active) {
        ws.send(JSON.stringify({
            type: "UPDATE_LOCATION",
            user: {
                id: myUser.id,
                name: myUser.name,
                lat: myUser.lat,
                lng: myUser.lng,
            }
        }))
    }
});

$("#create-room-btn").click(() => {
    const displayName = $('#name-input').val();
    myUser.name = displayName;

    ws.send(JSON.stringify({
        type: "CREATE_ROOM",
        user: {
            id: myUser.id,
            name: myUser.name,
            lat: myUser.lat,
            lng: myUser.lng,
        }
    }))
});

$("#join-room-btn").click(() => {
    const displayName = $('#name-input').val();
    const roomID = $('#room-input').val();

    myUser.name = displayName;
    myRoom.id = roomID;

    ws.send(JSON.stringify({
        type: "JOIN_ROOM",
        roomID: roomID,
        user: {
            id: myUser.id,
            name: myUser.name,
            lat: myUser.lat,
            lng: myUser.lng,
        }
    }))
})

const messageHandler = function (e) {
    const msg = JSON.parse(e.data);

    if (msg.type == "JOINED_ROOM") {
        myUser.id = msg.user.id;

        myRoom.active = true;
        myRoom.id = msg.roomID;
        myRoom.users = msg.users;

        myRoom.users
            .filter(user => user.id != myUser.id)
            .forEach(user => {
                user.marker = L.marker([user.lat, user.lng])
                    .bindTooltip(`<b>${user.name}</b>`, { permanent: true })
                    .addTo(map);
            })

        updateControls(myRoom.id, myRoom.users.length);
    }

    if (msg.type == "NEW_USER") {
        const user = msg.user;
        myRoom.users.push({
            ...user,
            marker: L.marker([user.lat, user.lng])
                .bindTooltip(`<b>${user.name}</b>`, { permanent: true })
                .addTo(map)
        })

        updateControls(myRoom.id, myRoom.users.length);
    }

    if (msg.type == "USER_UPDATE_LOC") {
        const user = myRoom.users.find(u => u.id == msg.user.id && u.id != myUser.id);
        if (!user) { return; }

        user.lat = msg.user.lat;
        user.lng = msg.user.lng;

        user.marker.setLatLng([user.lat, user.lng]);
    }

    if (msg.type == "USER_LEFT") {
        const user = myRoom.users.find(u => u.id == msg.user.id);

        if (!user) { return; }
        map.removeLayer(user.marker);
        myRoom.users = myRoom.users.filter(u => u.id == user.id);
        updateControls(myRoom.id, myRoom.users.length);
    }

};

ws.addEventListener("message", messageHandler);