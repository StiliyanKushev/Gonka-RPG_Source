//setup exress
let express = require("express");
let app = express();
//setup the server port and ip address so that it also works with openshift
let server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
let server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
//listen to the port and ip address
let server = app.listen(server_port, server_ip_address, function () {
    console.log("Listening on " + server_ip_address + ", port " + server_port)
});
//use the folder called "public" inside of which there will be all the data
app.use(express.static('./client/public'));
//setup the sockets
let socket = require("socket.io");
let io = socket(server);

//game logic here!
//this array keeps all of the map json objects in the maps folder
//#NOTE that it only contains the maps and not the ROOMS of the game
let allMaps = [];
const fs = require('fs');
//this block of code reads all maps from the global "maps" folder and pushes them in the allMaps array
fs.readdirSync("./server/maps/").forEach(file => {
    let r = JSON.parse(fs.readFileSync('./server/maps/' + file));
    allMaps.push(r);
})
//this array keeps all of the game room objects
let gameRooms = [];
//this function returns a random number or a random item from an array if given argument arr
function random(arr) {
    if (typeof arr != 'number') {
        let randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    } else {
        return Math.floor(Math.random() * arr);
    }
}
//this function creates a new room with a randomly selected map
function addGameRoom() {
    let room = random(allMaps);
    room.index = gameRooms.length + 1;
    gameRooms.push(room);
}
//add at least one room at the start
addGameRoom();

//this function removes the left user from the game room that he was and notifies all other players
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

setInterval(function(){
    for(let room of gameRooms){
        for(let member of room.members){
            io.sockets.connected[member.id].emit('receivingPlayers', room.members);
        }
    }
},20);

//when a new client connects
io.sockets.on('connection', function (socket) {
    //when the client disconnects
    socket.on('disconnect', function () {
        //remove it from the game
        removeFromGame(socket.id);
    });
    //when the user send his current location
    socket.on('sendingPlayer', function (data) {
        //send that information to all other players in the room
        for (let room of gameRooms) {
            for (let i = 0; i < room.members.length; i++) {
                if (room.members[i].id === socket.id) {
                        room.members[i].x = data.x;
                        room.members[i].y = data.y;
                    return;
                }
            }
        }
        // socket.broadcast.emit('receivingPlayers', data);
    });
    //when the user tries to join in a room
    socket.on('getRoom', function (username) {
        let selected = {};
        //validate the tempUsername from the client and if invalid
        //return empty string meaning that the user must enter valid name
        if (username == null || username.trim() == "") selected = '';
        //if it is valid then join the first room that is not full
        else
            for (let room of gameRooms) {
                //if the room is not full
                if (room.members.length != room.maxMembers) {
                    //if there isn't a player with that name in the room
                    if ((() => {
                            for (let member of room.members) {
                                if (member.name == username) return false;
                            }
                            return true;
                        })()) {
                        //add that player in the current room
                        room.members.push({
                            id: socket.id,
                            name: username,
                            x:0,
                            y:0
                        });
                        selected = room;
                    } 
                    //else return invalid
                    else selected = '';
                    break;
                }
            }
        //then return the respone only to that spesific user
        io.sockets.connected[socket.id].emit('returnRoom', [selected, selected.seeds]);
    });
});
