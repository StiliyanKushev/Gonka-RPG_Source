let socket = io.connect('https://demoTest.github.io');
function setup(){
	createCanvas(600,600);
	background(51);
	noStroke();
	noLoop();
	socket.on('mouse',function(data){
		fill(200,50,50);
		ellipse(data.x,data.y,30,30);
	});
}
function mouseDragged(){
	fill(255);
	ellipse(mouseX,mouseY,30,30);
	let data = {
		x:mouseX,
		y:mouseY
	}
	socket.emit('mouse',data);
}