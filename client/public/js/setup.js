//thats the game mode that the propgram will constatly check for in the draw loop/function
//it can be :
//MENU -> while the player is in the menu
//GAMEMODE -> while the player is playing
let GAMEMODE = "MENU";
//thats the FPS variable.Set to 60 fps just so it isnt undefined but
//in reallity the program is the one that check for the fps and display it
let FPS = 60;
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
//this is just a function that displays all errors or info to the user
function myAlert(str) {
	alert(str);
}
//that is the setup function it gets called only once at the start
function setup() {
	//create the game canvas
	createCanvas(innerWidth, innerHeight);
	//set the pixel density to 1
	//for some reason that reduces the lag
	pixelDensity(1);
}