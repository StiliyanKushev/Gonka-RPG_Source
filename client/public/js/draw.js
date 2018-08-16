//thats the player object
let player;
//and thats an array keeping all pther players
let otherPlayers = [];
//thats the size of each spot in the grid that is beening displayed
const SPOT_SCL = 70;
//that is the draw function that gets called each frame
function draw() {
    if (GAMEMODE == "MENU") {
        //draw the backgroud
        background(45, 40, 60);
        strokeWeight(1);
        stroke(0);
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
        //drawing the spots of the map
        (() => {
            translate(width / 2 - player.pos.x - player.scl / 2, height / 2 - player.pos.y - player.scl / 2);
            (() => {
                for (let rowIndex = 0; rowIndex < roomMap.length; rowIndex++) {
                    for (let colIndex = 0; colIndex < roomMap[rowIndex].length; colIndex++) {
                        let [x, y] = [rowIndex * SPOT_SCL, colIndex * SPOT_SCL];
                        let currentSpot = roomMap[rowIndex][colIndex];
                        image(graphix[currentSpot.imgSource], x, y, SPOT_SCL, SPOT_SCL);
                    }
                }
            })();
            //draw all other players
            for (let otherPlayer of otherPlayers) {
                if (otherPlayer.name != username)
                    rect(otherPlayer.x, otherPlayer.y, player.scl, player.scl);
            }

            //draw the player
            player.show();
        })();
    }
}