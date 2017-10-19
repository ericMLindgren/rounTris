//View.js --- rounTris View class

import Controller from './Controller';
import {addPoints, subPoints, pointify} from './PointHelpers';

//Handles drawing game World, hud, as well as start and end screens... 


const canvas = document.getElementById('canvas');

paper.setup(canvas);

paper.view.draw();

export default function View() {

	let controller = null; //Pointer to the controller so we can pass view events

	let spinFlag = false; //Flags to flip if world changes so we know it needs redrawing
	let dropFlag = false;

	let loadingLogo = null;



	const boardLayer = new paper.Layer(),
		  blockLayer = new paper.Layer(),
		  blockPreviewLayer = new paper.Layer(),
		  debrisLayer = new paper.Layer(),
		  menuLayer = new paper.Layer();


	//GameBoard Objects TODO Deprecate these in favor of layers for all tasks
	let worldCore = null; 
	const allRings = []; //list of each paper.Path.RegularPolygon that form the worlds rings

	//Game Block objects TODO Deprecate these in favor of layers for all tasks
	const blockReps = []; //Lists to collect our paper items for easy removal later
	const debrisReps = [];




	const worldColors = { //This should be read from a file or passed TODO
		coreFill: 'white',//Also clean up styles to produce no borders but also no coreners TODO
		coreStroke: 'black',
		blockFill: 'grey',
		debrisFill: 'black',
		debrisStroke: null,
		debrisStrokeWidth: .5,
		lossFill: 'red',
		lossStrokeWidth: .5
	}

	const drawBoard = (worldState) => {

			boardLayer.activate();

			if (worldCore) {
				worldCore.remove()
				worldCore = null;
				while (allRings.length>0){
					allRings.pop().remove() //remove from list and paper world. 
				}
			}

			//Make Core
			worldCore = new paper.Path.RegularPolygon({
				radius: worldState.coreRadius,
				center: paper.view.center,
				sides: worldState.x,
				fillColor: worldColors.coreFill,
				strokeColor: worldColors.coreStroke,
				opacity: 1
			});

			//Make outer board
			for (let i = 1;i <= worldState.y;i++){
				if (i>1) {
					worldState.coreRadius += ((2*Math.PI*worldState.coreRadius)/worldState.x);
				}
					
			 
				const newLayer = new paper.Path.RegularPolygon({
					radius: worldState.coreRadius,
					center: paper.view.center,
					sides: worldState.x,
				});
				

				allRings.push(newLayer);

			}

			allRings[worldState.lossHeight].strokeColor = worldColors.lossFill;
			allRings[worldState.lossHeight].strokeWidth = worldColors.lossStrokeWidth;

		};

	const updateBoard = (worldState) => {
		if (worldState){ //If there's a stat object, ie change in the world
			if (worldState.flags.BLOCK) {

				blockLayer.activate();

				//Set drawing style for block
				const blockStyle = { //TODO this could be handled better maybe even using functions for values to allow for animation, would mean rethinking redraw rate.
						fillColor: worldColors.blockFill
					}


				while (blockReps.length > 0) {//Remove all block drawings
					blockReps.pop().remove();
				}

				for (let block of worldState.blocks){
					for (let piece of block.shape()){
						let piecePos = addPoints(block.position(), piece);

						piecePos = worldState.wrapPos(piecePos); //Make sure position is in coordinate system.

						const newBlockRep = drawAtPos(piecePos, blockStyle, worldState);
				        blockReps.push(newBlockRep); //add to list to remove later
				    }
				}

				//Draw block previews

				while (blockPreviewLayer.children.length>0)
					blockPreviewLayer.children.pop().remove();

				// blockPreviewLayer.activate()
				for (let block of worldState.blocks){
					//If block is out of frame:
						drawBlockPreview(block);
				}
			}

			if (worldState.flags.DEBRIS) {

				debrisLayer.activate();

				const debrisStyle = {
					fillColor: worldColors.debrisFill,
					strokeColor: worldColors.debrisStroke,
					strokeWidth: worldColors.debrisStrokeWidth
				}

				while (debrisReps.length > 0) //Remove all block drawings
					debrisReps.pop().remove();

				//Draw new debris:
				for (let dX = 0; dX < worldState.x; dX++){
					for (let dY = 0; dY < worldState.y; dY++){
						// console.log('reading x: ' + dX + ' y: '+ dY);
						if (worldState.debris[dX][dY]){
							const newDebrisRep = drawAtPos({x: dX, y: dY} , debrisStyle, worldState);
			        		debrisReps.push(newDebrisRep); //add to list to remove later
						}
					}
				}
			}
		}
	}

	const drawAtPos = (drawPos, styleOb, worldState) => {

		// console.log('drawAtPos');
		
		//This should handle the actual drawing
		let nextPos = drawPos.x+1; //Wrapping should be handled by world?
		if (nextPos>worldState.x-1) nextPos = 0; //necessary for drawing blocks that stradle world wrap line

		//Make shape
        const newBlockRep = new paper.Path.Line(allRings[drawPos.y].segments[drawPos.x].point, allRings[drawPos.y].segments[nextPos].point);     
        newBlockRep.lineTo(allRings[drawPos.y+1].segments[nextPos].point);
        newBlockRep.lineTo(allRings[drawPos.y+1].segments[drawPos.x].point);
        newBlockRep.closePath();

        //Apply styles
        for (let prop in styleOb){
        	newBlockRep[prop] = styleOb[prop];
        }

        return newBlockRep;
	}

	const textButton = (propOb) => {
		menuLayer.activate();

		const text = new paper.PointText({ 
			    point: paper.view.center,
			    content: propOb.content,
			    fillColor: 'black',
			    fontFamily: 'Courier New',
			    fontWeight: 'bold',
			    fontSize: propOb.size
			});

		text.position = propOb.position;
		text.onClick = propOb.callback;

	}

	const drawBlockPreview = (block) => {

		//Defines block shape
		let grid = [0,0,0,
					0,0,0,
					0,0,0];

		//makes individual pieces
		const makeSinglePiece = (position) => {
    		return new paper.Path.Rectangle({
		        point: position,
		        size: [20,20],
		        fillColor: 'black',
		        strokeColor: 'white'
		    });
    	}

		var drawPos = paper.view.center;
		var blockRep = new paper.Group();

		for (var i in grid){
		    if (grid[i]) {
		        blockRep.addChild(smallSquare(drawPos))
		    }
		    
		    if ((parseInt(i)+1)%3==0){
		        drawPos += [-40,20]   
		        
		    } else {
		        drawPos += [20,0]
		    }
		}

		//Creates a drop shadow and adds to blockRep group
		var shadow = blockRep.clone();
		shadow.opacity = .2;
		shadow.position += [-5, 5];
		blockRep.addChild(shadow);

		//Draws preview bubble
		var bubble = new paper.Path.Circle({
		    center: blockRep.position - [0,5],
		    radius: 50,
		    fillColor: 'white',
		    strokeColor: 'black',
		    strokeWidth: 2
		});

		return new paper.Group(bubble, blockRep);


	}

	const setGameOpacity = (newOpacity) => {
		blockLayer.opacity = newOpacity;
		debrisLayer.opacity = newOpacity;
		boardLayer.opacity = newOpacity;

	}

	const clearAllLayers = () => {
		for (let layer of paper.project.layers){
			clearLayer(layer);
		}
	}

	const clearLayer = (layerToClear) => {
		for (let i = layerToClear.children.length-1; i>-1; i--){
				layerToClear.children[i].remove();
			}
	}

	const startScreen = () => {
		clearAllLayers();
		textButton({
				content: 'BEGIN', 
				position: paper.view.center,
				size: 50,
				callback: controller.startGame});
	}

	const loadScreen = () => {

		textButton({
				content: '...LOADING SOUNDS...', 
				position: paper.view.center,
				size: 25,
				callback: null});

		textButton({
				content: 'HEADPHONES RECOMMENDED', 
				position: addPoints(paper.view.center, [0, 20]),
				size: 10,
				callback: null});

		loadingLogo = new  paper.Path.RegularPolygon({
					radius: 10,
					center: addPoints(paper.view.center, [0,50]),
					sides: 4,
					strokeColor: 'black',
					strokeWidth: 3,
					fillColor: 'ghostwhite'
				});

	}

	const passiveAnimations = (event, worldState) => {
		if (allRings[worldState.lossHeight])
					allRings[worldState.lossHeight].strokeWidth = (Math.sin(event.time*5))*.5+1
				//This should not need continous worldState TODO
	}


	loadScreen();

	return {
		tick: (worldState, event) => {
			updateBoard(worldState);
			passiveAnimations(event, worldState);
		},

		clearScreen: () => {
			for (let i = 0; i<paper.project.activeLayer.children.length; i++){
				paper.project.activeLayer.children[i].remove();
			}
		},

		startScreen: startScreen,

		playScreen: (gameState) => {
			clearLayer(menuLayer);
			drawBoard(gameState);
			setGameOpacity(1);
		},

		pauseScreen: () => {
			setGameOpacity(.2)
			textButton({
				content: 'PAUSE', 
				position: paper.view.center,
				size: 50,
				callback: null});
		},

		unPauseScreen: () => {
			clearLayer(menuLayer);
			setGameOpacity(1);
		},

		lossScreen: function(){
			setGameOpacity(.5);
			textButton({
				content: 'YOU LOSE!', 
				position: paper.view.center,
				size: 50,
				callback: startScreen});

			textButton({
				content: 'PLAY AGAIN?', 
				position: addPoints(paper.view.center, [0,40]),
				size: 25,
				callback: startScreen});

		},

		setController: (newController) => {
			controller = newController;
			paper.view.onKeyDown = controller.keyDown;
			paper.view.onFrame = (event) => {


				if (loadingLogo)
					loadingLogo.rotate(1);

				controller.tick(event);
			}
		},
	}
}


