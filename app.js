const http = require('http');
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const heartbeat = require('./src/heartbeat');
const locationSharing = require('./src/locationSharing');

const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0"

const app = express();
const server = http.createServer(app);

const root = path.resolve(__dirname);
app.use(express.static(root + '/public'));

const wss = new WebSocket.Server({ server });

heartbeat.bind(wss);
locationSharing.bind(wss);

server.listen(PORT, HOST, () => {
    console.log(`Starting server on port ${PORT}`);
});

