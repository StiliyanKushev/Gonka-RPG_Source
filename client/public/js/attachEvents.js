//reduces the lag a litle bit because the program doesnt have to check for errors every frame
p5.disableFriendlyErrors = true;
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
//this block of code clears the pressedKeys array when the use hides the tab or the tab is incative
$(window).on("blur focus", function (e) {
	if ($(this).data("prevType") != e.type && e.type == "blur") {
		pressedKeys = [];
	}
	$(this).data("prevType", e.type);
})
//reset the canvas when entering fullscreen mode;
window.onresize = function () {
	createCanvas(innerWidth, innerHeight);
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
//and that is a function that triggers an event that checks for the release of a key
function keyReleased() {
	//if any of the keys are released it removes them from the pressedKeys array
	//and that way it keeps the array UP TO DATE
	if (key == "A") pressedKeys.splice(pressedKeys.indexOf('A'), 1);
	else if (key == "S") pressedKeys.splice(pressedKeys.indexOf('S'), 1);
	else if (key == "D") pressedKeys.splice(pressedKeys.indexOf('D'), 1);
	else if (key == "W") pressedKeys.splice(pressedKeys.indexOf('W'), 1);
}