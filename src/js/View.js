//View.js --- rounTris View class

import Controller from './Controller';

//Handles drawing game World, hud, as well as start and end screens... 


const canvas = document.getElementById('canvas');

paper.setup(canvas);

paper.view.draw(); //Seems to need only one call to begin drawing...



//Should split worldState and worldDimensions

export default function View() {

	let controller = null; //Pointer to the controller so we can pass view events

	const allLayers = []; //list of each paper.Path.RegularPolygon that form the worlds rings

	const blockReps = []; //Lists to collect our paper items for easy removal later
	const debrisReps = [];

	let spinFlag = false; //Flags to flip if world changes so we know it needs redrawing
	let dropFlag = false;

	const worldColors = {
		coreFill : 'blue',
		coreStroke : 'black',
		blockFill : 'teal',
		debrisFill : 'black',
		lossFill : 'red',
		lossWeight : .5
	}


	let worldShape = { //This should be defined elsewhere but for now defines the dimensions of our world TODO
		center: paper.view.center, //TODO really need to centralize this
		lossHeight:8,
		coreRadius : 25,
		x : 20,
		y : 15
	}; 

	const updateHud = function(worldState){ //updates HUD like score, level, etc...

	}

	const updateBoard = function(worldState) {
		if (worldState){ //If there's a stat object, ie change in the world
			if (worldState.flags.BLOCK) {

				//Set drawing style for block
				const blockStyle = { //TODO this could be handled better maybe even using functions for values to allow for animation, would mean rethinking redraw rate.
						fillColor : worldColors.blockFill
					}


				while (blockReps.length > 0) {//Remove all block drawings
					blockReps.pop().remove();
				}

				for (let block of worldState.blocks){
					const newBlockRep = drawAtPos(block.position() , blockStyle);
			        blockReps.push(newBlockRep); //add to list to remove later
				}
			}

			if (worldState.flags.DEBRIS) {

				const debrisStyle = {
					fillColor : worldColors.debrisFill,
				}

				while (debrisReps.length > 0) //Remove all block drawings
					debrisReps.pop().remove();

				//Draw new debris:
				console.log(worldState.debris[0]);
				for (let dY = 0; dY < worldShape.x; dY++){
					for (let dX = 0; dX < worldShape.y; dX++){
						// console.log('reading x: ' + dX + ' y: '+ dY);
						if (worldState.debris[dX][dY]){
							const newDebrisRep = drawAtPos({x: dX, y: dY} , debrisStyle);
			        		debrisReps.push(newDebrisRep); //add to list to remove later
						}
					}
				}
					

					
				

				//Draw new DEBRIS TODO
			}
		}

	}

	const drawAtPos = function(drawPos, styleOb){

		console.log('drawAtPos');
		console.log(drawPos);
		//This should handle the actual drawing
		let nextPos = drawPos.x+1; //Wrapping should be handled by world?
		if (nextPos>worldShape.x-1) nextPos = 0; //necessary for drawing blocks that stradle world wrap line

		//Make shape
        const newBlockRep = new paper.Path.Line(allLayers[drawPos.y].segments[drawPos.x].point, allLayers[drawPos.y].segments[nextPos].point);     
        newBlockRep.lineTo(allLayers[drawPos.y+1].segments[nextPos].point);
        newBlockRep.lineTo(allLayers[drawPos.y+1].segments[drawPos.x].point);
        newBlockRep.closePath();

        //Apply styles
        for (let prop in styleOb){
        	newBlockRep[prop] = styleOb[prop];
        }

        return newBlockRep;
	}


	
	return {
		tick : function (worldState) {
			updateHud(worldState);
			updateBoard(worldState);
		},

		clearScreen : () => {
			for (let i = 0; i<paper.project.activeLayer.children.length; i++){
				paper.project.activeLayer.children[i].remove();
			}
		},

		startScreen : function(){

			var startText = new paper.PointText({ 
			    point: worldShape.center,
			    content: 'BEGIN',
			    fillColor: 'black',
			    fontFamily: 'Courier New',
			    fontWeight: 'bold',
			    fontSize: 50
			});
			startText.position = worldShape.center;

			startText.onClick = controller.startGame;
		},

		lossScreen : function(){

		},

		setWorldShape : function (newWorldShape){
			worldShape = newWorldShape;
		},

		setController : function(newController){
			controller = newController;
			paper.view.onKeyDown = controller.keyDown;
			paper.view.onFrame = controller.tick;
		},

		makeHud : function() { },

		makeBoard : function(){ 
			//Make Core
			const worldCore = new paper.Path.RegularPolygon({
				radius: worldShape.coreRadius,
				center: worldShape.center,
				sides: worldShape.x,
				fillColor: worldColors.coreFill,
				strokeColor: worldColors.coreStroke
			});

			//Make outer board
			for (let i = 1;i <= worldShape.y;i++){
				if (i>1) {
					worldShape.coreRadius += ((2*Math.PI*worldShape.coreRadius)/worldShape.x);
				}
					
			 
				const newLayer = new paper.Path.RegularPolygon({
					radius: worldShape.coreRadius,
					center: worldShape.center,
					sides: worldShape.x,
					// strokeColor: 'black' //remove after debugging
				});
				

				allLayers.push(newLayer);

			}

			allLayers[worldShape.lossHeight].strokeColor = worldColors.lossFill;
			allLayers[worldShape.lossHeight].strokeWidth = worldColors.lossWeight;

		},


	}
}

// const test = new View();
// test.startScreen();

console.log('View Class Loaded');



