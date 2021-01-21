const niceware = require('niceware');

const bind = function (wss) {

    const rooms = {};

    wss.on('connection', async function (ws) {

        const userID = niceware.generatePassphrase(8).join('-');
        const user = {
            id: userID,
            name: null,
            lat: null,
            lng: null,
            room: null,
            ws: ws,
        };

        ws.user = user;

        ws.on('message', async function (payload) {
            const message = JSON.parse(payload);

            if (message.type == 'CREATE_ROOM') {
                const roomID = niceware.generatePassphrase(4).join('-');
                const room = {
                    id: roomID,
                    users: [user],
                };

                rooms[roomID] = room;

                user.name = message.user.name;
                user.lat = message.user.lat;
                user.lng = message.user.lng;
                user.room = room;

                ws.send(JSON.stringify({
                    type: 'JOINED_ROOM',
                    user: {
                        id: user.id,
                        name: user.name,
                        lat: user.lat,
                        lng: user.lng,
                    },
                    roomID: roomID,
                    users: room.users.map(u => ({
                        id: u.id,
                        name: u.name,
                        lat: u.lat,
                        lng: u.lng
                    }))
                }));
            }

            if (message.type == 'JOIN_ROOM') {
                const room = rooms[message.roomID];

                if (!room) {
                    ws.send(JSON.stringify({
                        type: 'ERROR',
                        message: `the room with id ${message.roomID} does not exist`
                    }))
                    return;
                }

                user.name = message.user.name;
                user.lat = message.user.lat;
                user.lng = message.user.lng;
                user.room = room;

                room.users.forEach((u) => {
                    u.ws.send(JSON.stringify({
                        type: 'NEW_USER',
                        user: {
                            id: user.id,
                            name: user.name,
                            lat: user.lat,
                            lng: user.lng,
                        }
                    }))
                })

                room.users.push(user);

                ws.send(JSON.stringify({
                    type: 'JOINED_ROOM',
                    user: {
                        id: user.id,
                        name: user.name,
                        lat: user.lat,
                        lng: user.lng,
                    },
                    roomID: room.id,
                    users: room.users.map(u => ({
                        id: u.id,
                        name: u.name,
                        lat: u.lat,
                        lng: u.lng
                    }))
                }));
            }

            if (message.type == 'UPDATE_LOCATION') {
                user.lat = message.user.lat;
                user.lng = message.user.lng;

                user.room.users.forEach((u) => {
                    u.ws.send(JSON.stringify({
                        type: 'USER_UPDATE_LOC',
                        user: {
                            id: user.id,
                            name: user.name,
                            lat: user.lat,
                            lng: user.lng,
                        }
                    }))
                })
            }

        });
    });


    wss.on('disconnection', async function (ws) {
        const user = ws.user;
        const room = user.room;
        if (!room) { return; }

        room.users = room.users.filter(u => u != user);

        if (room.users.length == 0) {
            delete rooms[room.id];
            return;
        }

        room.users.forEach((u) => {
            u.ws.send(JSON.stringify({
                type: "USER_LEFT",
                user: {
                    id: user.id,
                    name: user.name,
                    lat: user.lat,
                    lng: user.lng,
                }
            }))
        })
    });
};

module.exports = {
    bind,
}