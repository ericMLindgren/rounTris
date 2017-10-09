//View.js --- rounTris View class

import Controller from './Controller';

//Handles drawing game World, hud, as well as start and end screens... 


const canvas = document.getElementById('canvas');

paper.setup(canvas);

paper.view.draw(); //Seems to need only one call to begin drawing...

//Should split worldState and worldDimensions

export default function View() {

	let controller = null;
	const allLayers = [];

	const worldColors = {
		coreFill : 'blue',
		coreStroke : 'black',
		blockFill : 'teal',
		debrisFill : 'black',
		lossFill : 'red',
		lossWeight : .5
	}


	let worldShape = {
		center: paper.view.center,
		lossHeight:8,
		coreRadius : 25,
		x : 20,
		y : 15
	}; 

	const updateHud = function(worldState){

	}

	const updateBoard = function(worldState) {

	}

	const clearScreen = function() {
		for (let i = 0; i<paper.project.activeLayer.children.length; i++){
			paper.project.activeLayer.children[i].remove();
		}
	}

	
	return {
		tick : function (worldState) {
			drawHud(worldState);
			updateBoard(worldState);
		},

		startScreen : function(){
			clearScreen();

			var startText = new paper.PointText({ 
			    point: worldShape.center,
			    content: 'BEGIN',
			    fillColor: 'black',
			    fontFamily: 'Courier New',
			    fontWeight: 'bold',
			    fontSize: 50
			});
			startText.position = worldShape.center;

			startText.onClick = controller.startGame();
		},

		lossScreen : function(){

		},

		setWorldShape : function (newWorldShape){
			worldShape = newWorldShape;
		},

		setController : function(newController){
			controller = newController;
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
					strokeColor: 'black' //remove after debugging
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



