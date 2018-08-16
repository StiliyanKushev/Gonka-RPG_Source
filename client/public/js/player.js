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
        this.speed = 0.3;
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