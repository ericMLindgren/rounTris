//World Code

var worldSize = new Point(20,15);
var lossHeight = 8;
var lastRad = 25

var world = new Path.RegularPolygon({
	radius: lastRad,
	center: view.center,
	sides: worldSize.x,
	fillColor: 'blue',
	strokeColor: 'blue'
});


//Make gamefield

var allLayers = [];
for (var i = 1;i <= worldSize.y;i++){
	if (i>1) {
		lastRad += ((2*Math.PI*lastRad)/worldSize.x);
	}
		

	var newLayer = new Path.RegularPolygon({
		radius: lastRad,
		center: view.center,
		sides: worldSize.x
		//strokeColor: 'black'
	});
	

	allLayers.push(newLayer);

}

allLayers[lossHeight].strokeColor = 'red';
allLayers[lossHeight].strokeWidth = .5;

//Block Code
var stateColor = {'falling' : 'teal', 'stuck':'black', 'loser':'red'};
allBlocks = [];
function Block(pos){ //Move almost all this.functions to prototypes TODO
	if (pos instanceof Array) //Accept both array and Point in construction
		this.position = new Point(pos);
	else if (pos instanceof Point)
		this.position = pos;
	else {
		console.log('ERROR: Block passed bad "pos" in constructor');
		return -1;
	}

	this.state = 'falling';
	this.rep = new Path.Line();

	allBlocks.push(this);

	this.setPosition = function(newPos, dirMod){


		if (newPos.x < 0) {
			if (this.state=='falling') console.log('Position was:' + newPos);
			newPos.x = worldSize.x-1;
			if (this.state=='falling') console.log('Position is now:' + newPos);
		} else if (newPos.x > worldSize.x-1) {
			newPos.x = 0;
			
		}
				// console.log(newPos);
		var bumpBlock = isEmpty(newPos);
		if (bumpBlock.state == 'falling') { //Bug with things getting pushed! TODO
			bumpBlock.setPosition(bumpBlock.position + [dirMod,0]);	//should be called blockAt(pos) TODO	
		}
		this.position = newPos;
		this.draw();
	}.bind(this);

	this.drop = function() {
		if (this.position.y == 1){ //If we're at bottom row, stick
			this.makeStuck();
			}
		else {
			if (isEmpty(this.position - [0,1]) == true)
				this.position.y -= 1; //If there's space below, drop
			else 
				this.makeStuck(); //If there's block below, stick
		}
	}.bind(this)

	this.draw = function() {
		this.rep.remove();
        
        if (this.position.x>worldSize.x) 
            this.position.x = 0;
        else if (this.position.x<0) this.position.x = worldSize.x;        
        
        var layer = this.position.y;
        var pos = this.position.x;
        
        //problem bridging TODO
        nextPos = pos+1;
        if (nextPos>worldSize.x-1) nextPos = 0;

        dbg('layer : ' + layer + '\nPos : ' + pos);
        dbg(allLayers);
        this.rep = new Path.Line(allLayers[layer].segments[pos].point,allLayers[layer].segments[nextPos].point);
        // this.rep.strokeColor = stateColor[this.state];
        this.rep.fillColor =  stateColor[this.state];
        this.rep.strokeWidth = 4;
        
        this.rep.lineTo(allLayers[layer-1].segments[nextPos].point);
        this.rep.lineTo(allLayers[layer-1].segments[pos].point);
        this.rep.closePath();
	}.bind(this); //Why don't arrow functions work here? :/ TODO

	this.makeStuck = function(){
		var totalStress = allBlocks.length/(worldSize.x*worldSize.y);
		var yStress = this.position.y/worldSize.y;
		
		// playSound("click",.5+(stress*.5)+(Math.random()*.2));
		playSound("click",.2+yStress);
		this.state = 'stuck';
		if (blocksInRow(this.position.y).length == worldSize.x)
			destroyRow(this.position.y);
			// console.log('ROW!!!');
		if (this.position.y == lossHeight+1){ //TODO pull this into seperate makeStuck function
			gameOver();
		}
	}.bind(this);

	this.destroy = function() {
		this.rep.remove();
		allBlocks.splice(allBlocks.indexOf(this),1);
	}.bind(this);



}

function gameStart() {
	GAME_RUNNING = true;
	playSound("play_music");
}

function gameOver(){ //TODO need tweening to make transitions more palattable.. 
	GAME_RUNNING=false;
	//Print Game Over Message (maybe with back screen)
	console.log('GAME OVER');
	var backDrop = new Path.Rectangle(view.bounds.topLeft,view.bounds.bottomRight);
	backDrop.fillColor = 'black';
	backDrop.opacity = .3;
	console.log(view.bounds);
	var endText = new PointText({
    point: [50, 50],
    content: 'Game Over!',
    fillColor: 'black',
    fontFamily: 'Courier New',
    fontWeight: 'bold',
    fontSize: 80
	});
	endText.position = view.center + [0, -90];
	
	//Offer replay buttons (need to better implement world code first)
	playSound("end_music");//TODO make music manager that handles ongoing things like game music
}

function destroyRow(rowNum){
	for (var i = allBlocks.length-1;i>=0;i--){
		if (allBlocks[i].position.y==rowNum)
			allBlocks[i].destroy()
		else if (allBlocks[i].position.y>rowNum)
			allBlocks[i].position.y -= 1;

	}
	playSound("destroy");

}


function blocksInRow(rowNum){
	var theseBlocks = [];
	for (var i in allBlocks){
		if (allBlocks[i].position.y==rowNum)
			theseBlocks.push(allBlocks[i]);
	}
	// console.log(theseBlocks);
	return theseBlocks;
}

function isEmpty(pos){
	// console.log(pos)
	for (var i in allBlocks){
		if (pointComp(allBlocks[i].position, pos)) {//if we find block in this position return false; 
			// console.log('bump');
			return allBlocks[i];
		}

		
	}
	return true;
}

//Hellper function
function pointComp(pointA, pointB){
	// console.log('Comparing : ' + pointA + ' to : ' + pointB);
	if (pointA instanceof Array) //Convert arrays to points
		pointA = new Point(pointA[0],pointA[1]);
	if (pointB instanceof Array)
		pointB = new Point(pointB[0],pointB[1]);

	if (pointA.x == pointB.x && pointA.y == pointB.y)
		return true;
	else
		return false;
}

//Helper functions
var DEBUG_ON = false;
function dbg(msg){
	if (DEBUG_ON){
		console.log(msg);
	}
}
//Timer code

var moveRate = .2; //move every ? seconds
var genRate = .5; //make new block ''

var lastMove;
var lastGen;

var GAME_RUNNING = false;

function onFrame(event) {
	if (GAME_RUNNING){
		if (lastMove == undefined)
			lastMove = event.time; //start counting

		if (event.time-lastMove>moveRate){
			lastMove = event.time;
			moveBlocks();
		}

		if (lastGen == undefined)
			lastGen = event.time; //start counting

		if (event.time-lastGen>genRate){
			lastGen = event.time;
			makeBlocks();
		}
	}
}



function makeBlocks(){
    var newX = Math.floor(Math.random() * (worldSize.x-1));
  
    var newBlock = new Block([newX,worldSize.y-1]);
}

function makeBlocksAt(posAr){
	while (posAr.length>0){
		var thisEl = posAr.pop();
   		var newBlock = new Block([thisEl[0],thisEl[1]]);
	}
}

function moveBlocks(){
	for (var i in allBlocks) {
		if (allBlocks[i].state == 'falling'){
			allBlocks[i].drop();
		}
		if (allBlocks[i] != undefined)
			allBlocks[i].draw();
	}
}
//User triggered functions:
function togglePause() {
	GAME_RUNNING = !GAME_RUNNING;
	
}

function spinStuck(dir){
	if (GAME_RUNNING){
		if (dir == 'right')
			var xMod = 1;
		else 
			var xMod = -1; //Problems around world's end:

		for (var i in allBlocks){
			if (allBlocks[i].state == 'stuck'){
				allBlocks[i].setPosition(allBlocks[i].position + [xMod, 0], xMod);
			}
		}
	}
}

//DEBUG 
var completeRow=[];

for (var i = 0;i<worldSize.x;i++){
	completeRow.push([i,worldSize.y-1]);
}
// console.log(completeRow);
//Keyboard input

function onKeyDown(event){
	switch (event.key){
		case 'space':
			togglePause();
			// playSound("play_music");
			break;
		case 'left':
			spinStuck('left');
			break;
		case 'right':
			spinStuck('right');
			break;
		case 'g': //just for debugging
			gameOver();
			break;
	}
}

//Sound Stuff

var soundsLoaded = 0;
function logLoad(){
	soundsLoaded += 1;
	if (soundsLoaded==Object.keys(soundSources).length)
		finishedLoadingSound();
}

function finishedLoadingSound(){
	gameStart(); //Need music manager TODO
}

var soundSources = {
    "destroy": "./sounds/30937__aust-paul__whatever.wav",
    "woosh": "./sounds/25073__freqman__whoosh04.wav",
    "click": "./sounds/26777__junggle__btn402.mp3",
    "play_music": "./sounds/384468__frankum__vintage-elecro-pop-loop.mp3",
    "end_music": "./sounds/33796__yewbic__ambience03.wav"
}
var soundBuffers = {};



window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();



// Fix up prefixing



// var allSounds = {};
function playSound(bufferKey, rate, loop) {//TODO rewrite with gain nodes and pitch nodes
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = soundBuffers[bufferKey];                    // tell the source which sound to play
  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  source.playbackRate.value = rate;
  // source.loop = true;
  source.start(0);                           // play the source now
                                             // note: on older systems, may have to use deprecated noteOn(time);
  if (bufferKey == 'play_music') {
      	source.loop = true;
      	console.log('looping ', bufferKey);
  }                                             
}

// function playClick() {
// 	var source = context.createBufferSource(); // creates a sound source
// 	source.buffer = soundBuffers["click"];
// 	                   // tell the source which sound to play
// 	source.connect(context.destination);       // connect the source to the context's destination (the speakers)
// 	source.start(0);   
// }

function loadSound(url,bufferKey) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      soundBuffers[bufferKey] = buffer;
      
      logLoad();
    });
  }
  request.send();
}


for (var i in Object.keys(soundSources)){
    loadSound(soundSources[Object.keys(soundSources)[i]],Object.keys(soundSources)[i]);
}
 
// TODO Use buffer object to delay start of game until all sounds are loaded and then begin playing music when game starts...


// program code
