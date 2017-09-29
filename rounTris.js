
var planets = [];
var planet =  new Path.RegularPolygon(view.center, 20, 100);
planet.strokeColor = 'green';
planet.strokeWidth = 1;

var planet2 = planet.clone().scale(1.35);
var planet3 = planet2.clone().scale(1.26);
var planet4 = planet3.clone().scale(1.2);
var planet5 = planet4.clone().scale(1.16);
var planet6 = planet5.clone().scale(1.14);

planets.push(planet);
planets.push(planet2);
planets.push(planet3);
planets.push(planet4);
planets.push(planet5);
planets.push(planet6);

//console.log(planets[0].segments[0]);
planets[0].fillColor = 'black';
planets[0].strokeColor = 'black';


var movingBlocks = [];
var stuckBlocks = [];
function Block(startPos) {
    this.position = startPos;
    
    this.rep = new Path.Line();
    
    
    movingBlocks.push(this);
    
    this.update = () => {
        this.rep.remove();
        
        var layer = this.position[0];
        var pos = this.position[1];
        
        this.rep = new Path.Line(planets[layer].segments[pos].point,planets[layer].segments[pos+1].point);
        this.rep.strokeColor = 'black';
        this.rep.strokeWidth = 4;
        
        this.rep.lineTo(planets[layer-1].segments[pos+1].point);
        this.rep.lineTo(planets[layer-1].segments[pos].point);
        this.rep.closePath();
    }
    
    this.makeStuck = () => {
        movingBlocks.splice(movingBlocks.indexOf(this),1);
        stuckBlocks.push(this);
        this.rep.strokeColor = 'red';
        console.log(stuckBlocks);
    }
    
    this.canDrop = () => { //How do we want to do collision detection?
        if (this.position[0]<2) return false; //already at bottom?
        var retval = true;
        
        if (stuckBlocks.length > 0){
            for (var stuckBlock of stuckBlocks){
                if (this.position - [1,0] == stuckBlock.position){
                    console.log(stuckBlock.position);
                    retval = false;
                }
            } 
        }
        //console.log('CanDrop? : ' + retval);
        return retval;
    }
}

// testBlock.selected = true;
var markMove = 0;
var markGen = 0; 
function onFrame(event) {
    if (markMove == 0) markMove = event.time; 
    if (markGen == 0) markGen = event.time; 
    
    if (event.time - markGen > 2){
        markGen = event.time;
        var newPos = Math.floor(Math.random() * 18) + 1;
     //   var newBlock = new Block([6,newPos]);
    }
    
    
    if (event.time - markMove > .5){ //move tick every half second...
        markMove = event.time;
        
        if (movingBlocks.length > 0){
            for (var thisBlock of movingBlocks){
                if (thisBlock.canDrop()) {
                    // console.log(blockPos[0]);
                    thisBlock.position[0] = thisBlock.position[0]- 1;
                    thisBlock.update();
                }
                else {
                    thisBlock.makeStuck();
                }
            }
        }
    }
}

var testBlock = new Block([6,1]);

setTimeout(function(){var aBlock = new Block([6,1]);}, 2000);


