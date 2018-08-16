//thats the program socket with which the program can send and recevie information from the server
let socket;
//create the socket and add its events
socket = io.connect(window.location.href);
//if your name is valid and not already taken the server returns a room for you
socket.on('returnRoom', function ([room, seeds]) {
    if (room === '') {
        myAlert('Invalid name or name already taken');
        loop();
    } else if (Object.keys(room).length == 0) {
        myAlert(`All servers are full.Try again later :)`);
        loop();
    } else {
        //change the game mode
        GAMEMODE = "RUNNING";
        strokeWeight(1);
        stroke(0);
        //save the map
        roomMap = room.map;
        roomIndex = room.index;
        //set the username
        username = tempName;
        //reset the mouse pressed event (idk why i did that but if it works we don't change it :d)
        mouseIsPressed = false;
        //pick a random spawnpoint from the map
        let sp = random(room.spawnpoints);
        //inti the player
        player = new Player(sp.r * SPOT_SCL, sp.c * SPOT_SCL);
        sendPlayerData();
        //load the image seeds
        //note that the game is already in noLoop state
        processImages(seeds);
    }
});
//when a new player joins the room
socket.on('receivingPlayers', function (data) {
    //update the player
    player.move();
    //send the player to the server
    sendPlayerData();
    //update the pther players
    otherPlayers = data;
});
//when a player leaves the room
socket.on('leftUser', function (data) {
    //remove the user from the otherPlayers array
    for (let i = 0; i < otherPlayers.length; i++) {
        if (otherPlayers[i].name == data.name) {
            otherPlayers.splice(i, 1);
            break;
        }
    }
});
//this function is used at the start of the moment you connect and at every other moment until you leave
function sendPlayerData() {
    //prepare the player data
    let data = {
        x: player.pos.x,
        y: player.pos.y,
        name: username
    }
    //and send it
    socket.emit('sendingPlayer', data);
}