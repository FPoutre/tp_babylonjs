const path = require('path');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);


let players = [];

function expressInit() {

    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({extended: true}));   // to support URL-encoded bodies
    app.use(express.static(path.join(__dirname, "/")));
    app.use(function(request, response, next) {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Headers", "*");
        response.header("Access-Control-Allow-Methods", "POST, GET");
	    next();
    });

    app.get("/", (req, res) => {
	    console.log('Incoming HTTP request for index.html');
        res.sendFile(path.join(__dirname + "/index.html"));
    });

    app.post("/", (req, res) => {
	    console.log('Incoming HTTP request for index.html');
        res.sendFile(path.join(__dirname + "/index.html"));
    });

    io.on('connection', socket => {

        socket.on('logIn', (data) => {
            console.log('login :\n' + data);
            let found = false;
            players.forEach(p => {
                if (p.name === data.name) {
                    found = true;
                }
            });
            if (!found) {
                socket.emit('players', players);
                players.push(data);
                socket.broadcast.emit('newPlayer', data);
            }
        });

        socket.on('update', (data) => {
            players.forEach(p => {
                if (p.name === data.name) {
                    p = data;
                }
            });
            socket.broadcast.emit('playersUpdate', players);
        });

        socket.on('disconnect', (data) => {
            players.forEach(p => {
                if (p.name === data.name) {
                    delete p;
                }
            });
            socket.broadcast.emit('logOut', data);
        });

    });

    http.listen(5000, () => {
        console.log('Server listening on port 5000...');
    });
}

expressInit();