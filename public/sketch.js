//thats the game mode that the propgram will constatly check for in the draw loop/function
//it can be :
//MENU -> while the player is in the menu
//GAMEMODE -> while the player is playing
let GAMEMODE = "MENU";
//thats the FPS variable.Set to 60 fps just so it isnt undefined but
//in reallity the program is the one that check for the fps and display it
let FPS = 60;
//thats the program socket with which the program can send and recevie information from the server
let socket;

//thats the room information that is beeng saved while the player is in 'gameplay' mode
let roomMap;
let roomIndex;

//thats the actualt username of the player
let username = null;
//thats a temporary one so that the server can check if it is valid
//and if thats true set the real username to it
let tempName;
function getName() {
	tempName = prompt("Please enter your name:");
}
//thats the player object
let player;
//and thats an array keeping all pther players
let otherPlayers = [];

//thats the size of each spot in the grid that is beening displayed
const SPOT_SCL = 70;

//that is preventing the user from zooming in and out
//#NOTE that it doesnt work for chrome
$(document).keydown(function (event) {
	if (event.ctrlKey == true && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109' || event.which == '187' || event.which == '189')) {
		event.preventDefault();
	}
});
$(window).bind('mousewheel.zoom DOMMouseScroll.zoom', function (event) {
	if (event.ctrlKey == true) {
		event.preventDefault();
	}
});
//this is just a function that displays all errors or info to the user
function myAlert(str) {
	alert(str);
}
//this is a spcial p5 function for trggering a mousePressed event
function mousePressed() {
	//here the program is trying to get a room
	if (GAMEMODE == "MENU") {
		//first those are the cordinates and sizes of the play btn
		let [w, h] = [width * 0.2, height * 0.1];
		let [x, y] = [(width / 2) - w / 2, (height / 2)];
		//after that the program checks if you have clicked on it
		if ((mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h)) {
			//in a case you did it sets the btn text to loading
			text('LOADING', x + (w / 2) - textWidth('LOADING') / 2, y + (h / 2) + textSize() / 3);
			//stops the program from drawing on the canvas
			noLoop();
			//gets the name 
			//#NOTE that it validates the tempName not the username
			getName();
			//then it send that data to the server
			//if the server decides that all is good it returns
			//to the user a room in side a returnRoom event
			socket.emit('getRoom', tempName);
		}
	}
}

//this array keeps track of all the keys that are beeing pressed 
//to make the player move better
let pressedKeys = [];
//thats another event function for triggering an event when a key is pressed BUT not released
function keyPressed() {
	//checks for a press of a specific keys and push them in the pressedKeys array
	if (key == "A") pressedKeys.push('A');
	else if (key == "S") pressedKeys.push('S');
	else if (key == "D") pressedKeys.push('D');
	else if (key == "W") pressedKeys.push('W');
}
//and that is a function that triggers an event that checks for the releas of a key
function keyReleased() {
	//if any of the keys are released it removes them from the pressedKeys array
	//and that way it keeps the array UP TO DATE
	if (key == "A") pressedKeys.splice(pressedKeys.indexOf('A'), 1);
	else if (key == "S") pressedKeys.splice(pressedKeys.indexOf('S'), 1);
	else if (key == "D") pressedKeys.splice(pressedKeys.indexOf('D'), 1);
	else if (key == "W") pressedKeys.splice(pressedKeys.indexOf('W'), 1);
}
//this object contains all of the resources needed for the specific room that the user is in
//NOTE that it deasnt load all resources but only the ones needed for the room
let graphix = {};

function processImages(seeds) {
	function proccessImage(seed) {
		loadImage(seed.imgSource, proccessDoneImage);

		function proccessDoneImage(res) {
			graphix[seed.imgSource] = res;
			if (Object.keys(graphix).length == seeds.length) {
				loop();
				return;
			};
		}
	}
	//loop to all seeds and process each 
	//while attachng a call back that checks if it was the last on
	//and in case thats true loops back the game
	for (let seed of seeds) {
		proccessImage(seed);
	}
}
//this function is used at the start of the moment you connect and at every other moment until you leave
function sendPlayerData(){
	//prepare the player data
	let data = {
		x:player.pos.x,
		y:player.pos.y,
		name:username
	}
	//and send it
	socket.emit('sendingPlayer',data);
}

function setup() {
	//create the game canvas
	createCanvas(innerWidth, innerHeight);
	//inti the player
	player = new Player(0, 0);
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
			GAMEMODE = "RUNNING";
			roomMap = room.map;
			roomIndex = room.index;
			username = tempName;
			mouseIsPressed = false;
			let sp = random(room.spawnpoints);
			player.pos = createVector(sp.r * SPOT_SCL, sp.c * SPOT_SCL);
			sendPlayerData();
			//load the image seeds
			//note that the game is already in noLoop state
			processImages(seeds);
		}
	});
	//when a new player joins the room
	socket.on('receivingPlayer',function(data){
		//add any new user to the players array
		if(otherPlayers.filter(e => e.name == data.name).length == 0)
		otherPlayers.push(data);
		else{
			for(let p of otherPlayers){
				if(p.name == data.name){
					p.x = data.x;
					p.y = data.y;
					break;
				}
			}
		}
	});
	//when a player leaves the room
	socket.on('leftUser',function(data){
		//remove the user from the otherPlayers array
		for(let i = 0; i < otherPlayers.length;i++){
			if(otherPlayers[i].name == data.name){
				otherPlayers.splice(i,1);
				break;
			}
		}
	});
}

function draw() {
	//reset the canvas (that prevents it for beeing hacked and also resize it when entering fullscreen mode);
	createCanvas(innerWidth, innerHeight);
	if (GAMEMODE == "MENU") {
		//draw the backgroud
		background(45, 40, 60);
		//draw the game logo
		(() => {
			fill(200);
			textSize(height * width * 0.00015);
			text('GONKA', (width / 2) - textWidth('GONKA') / 2, height / 3);
		})();
		//draw the play btn
		(() => {
			let [w, h] = [width * 0.2, height * 0.1];
			let [x, y] = [(width / 2) - w / 2, (height / 2)];
			push();
			if (!(mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h)) {
				noStroke();
				rect(x, y, w, h, 20);
				fill(45, 40, 60);
				rect(x + 5, y + 5, w - 10, h - 10, 20);
				fill(220);
				textSize(h * 0.5);
				text('PLAY', x + (w / 2) - textWidth('PLAY') / 2, y + (h / 2) + textSize() / 3);
			} else {
				noStroke();
				rect(x, y, w, h, 20);
				fill(220);
				rect(x + 5, y + 5, w - 10, h - 10, 20);
				fill(230, 20, 20);
				fill(45, 40, 60);
				textSize(h - 10);
				text('PLAY', x + (w / 2) - textWidth('PLAY') / 2, y + (h / 2) + textSize() / 3);
			}
			pop();
		})();
		//draw the credits of the game
		(() => {
			let credits = 'Coded by Stiliyan Kushev.\nSprites, animations and soundtrack by Vencislav Nikolov';
			textSize(10);
			text(credits, 0, height - textSize() * 2);
		})();
		//draw the links buttons with the credits
		(() => {
			let scl = 50;
			let offset = 10;
			let x = width - scl / 2 - offset;
			let y = height - scl / 2 - offset;
			let w = textWidth('f');
			let h = textSize();
			if (mouseX >= x - scl / 2 && mouseX <= x + scl / 2 && mouseY >= y - scl / 2 && mouseY <= y + scl / 2) {
				if (mouseIsPressed) {
					strokeWeight(4);
					fill(200);
					stroke(200);
					ellipse(x, y, scl, scl);
					textSize(30);
					stroke(220);
					fill(66, 52, 193);
					text("f", x - textWidth('f') / 2, y + textSize() / 3);
					window.location.href = "https://www.facebook.com/stel.kushev";
				} else {
					strokeWeight(4);
					fill(200);
					stroke(200);
					ellipse(x, y, scl, scl);
					textSize(30);
					stroke(220);
					fill(66, 52, 193);
					text("f", x - textWidth('f') / 2, y + textSize() / 3);
				}
			} else {
				stroke(220);
				strokeWeight(4);
				fill(66, 52, 193);
				ellipse(x, y, scl, scl);
				textSize(30);
				stroke(200);
				fill(200);
				text("f", x - textWidth('f') / 2, y + textSize() / 3);
			}
		})();
	} else if (GAMEMODE == "RUNNING") {
		background(0);
		//drawing the spots of the map nad draw and update the player
		(() => {
			push();
			translate(width / 2 - player.pos.x - player.scl / 2, height / 2 - player.pos.y - player.scl / 2);
			(() => {
				push();
				for (let rowIndex = 0; rowIndex < roomMap.length; rowIndex++) {
					for (let colIndex = 0; colIndex < roomMap[rowIndex].length; colIndex++) {
						let [x, y] = [rowIndex * SPOT_SCL, colIndex * SPOT_SCL];
						let currentSpot = roomMap[rowIndex][colIndex];
						image(graphix[currentSpot.imgSource], x, y, SPOT_SCL, SPOT_SCL);
					}
				}
				pop();
			})();
			//draw all other players
			for(let otherPlayer of otherPlayers){
				rect(otherPlayer.x,otherPlayer.y,player.scl,player.scl);
			}

			//update and draw the player
			player.show();
			player.move();
			//send the player to the server
			sendPlayerData();
			pop();
		})();
		//draw the fps each (n) frames
		(() => {
			if (frameCount % 30 == 0) {
				FPS = frameRate();
			}
			fill(255);
			textSize(30);
			text('' + FPS.toFixed(0), 5, 5 + textSize());
		})();
	}
}

//thats the player class
class Player {
	constructor(x, y) {
		//the position and the velocity are vectors
		//this pos keeps track of the position of the object in terms of x and y
		this.pos = createVector(x, y);
		//this vel keeps track of the diractions that the user wants to go
		//and later in the code it adds taht into the player postion
		this.vel = createVector();
		//this is the speed that the player will move with in if its not colling
		this.speed = 5;
		//and thats the size of the player
		this.scl = SPOT_SCL / 2;
	}
	//this function checks if the player touched somthing at a specific direction
	//picked from the move function 
	collide(dir) {
		if (dir == "left" && this.pos.x <= 0) return true;
		if (dir == "right" && this.pos.x + this.scl >= roomMap.length * SPOT_SCL) return true;
		if (dir == "up" && this.pos.y <= 0) return true;
		if (dir == "down" && this.pos.y + this.scl >= roomMap[0].length * SPOT_SCL) return true;

		for (let rowIndex = 0; rowIndex < roomMap.length; rowIndex++) {
			for (let colIndex = 0; colIndex < roomMap[rowIndex].length; colIndex++) {
				let [x, y] = [rowIndex * SPOT_SCL, colIndex * SPOT_SCL];
				let currentSpot = roomMap[rowIndex][colIndex];
				//check for the translarency
				if (currentSpot.properties.transparent == true) {
					if (dir == 'left') {
						if (this.pos.x <= x + SPOT_SCL &&
							this.pos.x + this.scl > x &&
							this.pos.y < y + SPOT_SCL &&
							this.pos.y + this.scl > y) return true;
					} else if (dir == 'right') {
						if (this.pos.x + this.scl >= x &&
							this.pos.x < x + SPOT_SCL &&
							this.pos.y < y + SPOT_SCL &&
							this.pos.y + this.scl > y) return true;
					} else if (dir == 'up') {
						if (this.pos.y <= y + SPOT_SCL &&
							this.pos.y + this.scl > y + SPOT_SCL &&
							this.pos.x + this.scl > x &&
							this.pos.x < x + SPOT_SCL) return true;
					} else if (dir == 'down') {
						if (this.pos.y + this.scl >= y &&
							this.pos.y < y &&
							this.pos.x + this.scl > x &&
							this.pos.x < x + SPOT_SCL) return true;
					}
				}
			}
		}
		return false;
	}
	move() {
		//and here is where pressedKeys comes in use
		//the move function checks for each key that is beening
		//pressed and modifies the velocity in a specific diraction
		if (pressedKeys.includes("A")) {
			if (!this.collide('left'))
				this.vel.x -= this.speed;
		}
		if (pressedKeys.includes("S")) {
			if (!this.collide('down'))
				this.vel.y += this.speed;
		}
		if (pressedKeys.includes("D")) {
			if (!this.collide('right'))
				this.vel.x += this.speed;
		}
		if (pressedKeys.includes("W")) {
			if (!this.collide('up'))
				this.vel.y -= this.speed;
		}
		this.pos.add(this.vel);
		this.vel.mult(0);
	}
	//and this function draws the player on the canvas
	//based on its cordinates
	show() {
		rect(this.pos.x, this.pos.y, this.scl, this.scl);
	}
}