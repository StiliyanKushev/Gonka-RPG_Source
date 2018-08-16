//this object contains all of the resources needed for the specific room that the user is in
//NOTE that it deasnt load all resources but only the ones needed for the room
let graphix = {};

function processImages(seeds) {
	function proccessImage(seed) {
		loadImage("./images/" + seed.imgSource.substr(1), proccessDoneImage);

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