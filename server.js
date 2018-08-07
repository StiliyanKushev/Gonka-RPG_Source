let express = require("express");
let app = express();
let server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
let server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
let server = app.listen(server_port, server_ip_address, function () {
    console.log("Listening on " + server_ip_address + ", port " + server_port)
});
app.use(express.static('public'));
let socket = require("socket.io");
let io = socket(server);

//game logic here!
let allMaps = [];
const mapsFolder = './maps/';
const fs = require('fs');

fs.readdirSync(mapsFolder).forEach(file => {
    let r = JSON.parse(fs.readFileSync('maps/' + file));
    allMaps.push(r);
})

let allPlayerNames = [];
let gameRooms = [];

function random(arr) {
    if (typeof arr != 'number') {
        let randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    } else {
        return Math.floor(Math.random() * arr);
    }
}

function addGameRoom() {
    let room = random(allMaps);
    room.index = gameRooms.length + 1;
    gameRooms.push(room);
}

addGameRoom();

function removeFromGame(id) {
    //find the room and the username and remove the player from the room
    let currentRoom;
    let playerUserName;
    for (let room of gameRooms) {
        for (let i = 0; i < room.members.length; i++) {
            if (room.members[i].id === id) {
                currentRoom = room;
                playerUserName = room.members[i].name;
                room.members.splice(i, 1);
                tellOthers();
                return;
            }
        }
    }

    function tellOthers() {
        //tell the others that the user has left
        if (currentRoom !== undefined)
            for (let member of currentRoom.members) {
                if (member.name != playerUserName) {
                    io.sockets.connected[member.id].emit('leftUser', {
                        name: playerUserName
                    });
                }
            }
        // io.sockets.emit('leftUser',{name:playerUserName});
    }
}

io.sockets.on('connection', function (socket) {
    socket.on('disconnect', function () {
        //remove it from the game
        removeFromGame(socket.id);
    });
    socket.on('sendingPlayer', function (data) {
        socket.broadcast.emit('receivingPlayer', data);
    });
    socket.on('getRoom', function (username) {
        let selected = {};
        if (username == null || username.trim() == "") selected = '';
        else
            for (let room of gameRooms) {
                if (room.members.length != room.maxMembers) {
                    if ((() => {
                            for (let member of room.members) {
                                if (member.name == username) return false;
                            }
                            return true;
                        })()) {
                        room.members.push({
                            id: socket.id,
                            name: username
                        });
                        selected = room;
                    } else selected = '';
                    break;
                }
            }
        io.sockets.connected[socket.id].emit('returnRoom', [selected, selected.seeds]);
        //socket.broadcast.emit('mouse',data);
    });
});