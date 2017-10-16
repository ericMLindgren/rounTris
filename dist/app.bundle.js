/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.pointify = pointify;
exports.addPoints = addPoints;
exports.subPoints = subPoints;
exports.getRandomInt = getRandomInt;
//PointHelpers.js
//Helper functions to easy point maths

function pointify(pointOrArray) {

	if (pointOrArray instanceof Array) return { x: pointOrArray[0], y: pointOrArray[1] };else return pointOrArray;
}

function addPoints(p1, p2) {

	p1 = pointify(p1);
	p2 = pointify(p2);

	// console.log(p1)
	// console.log(p2)

	return { x: p1.x + p2.x, y: p1.y + p2.y };
}

function subPoints(p1, p2) {

	p1 = pointify(p1);
	p2 = pointify(p2);

	return { x: p1.x - p2.x, y: p1.y - p2.y };
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Controller;

var _World = __webpack_require__(4);

var _World2 = _interopRequireDefault(_World);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } //Controller.js --- Controller Object for rounTris round tetris-style game

// Handles keyboard input and calls world/view methods as appropriate


function Controller(argOb) {
	//Controller is initialized with dimensions of the world
	var view = null;
	var world = null;
	var actionBuffer = null;
	var soundManager = null;

	var pauseMusic = null;
	var endMusic = null;
	var playMusic = null;

	var gameState = 'stopped';
	var PAUSED = false;

	var togglePause = function togglePause() {
		console.log('PAUSE/UNPAUSE');
		PAUSED = !PAUSED;

		if (PAUSED) {
			playMusic.stop();
			pauseMusic = soundManager.playSound('space_music', 2, true);

			view.pauseScreen();
		} else {
			pauseMusic.stop();
			playMusic = soundManager.playSound('play_music', 1, true);

			view.unPauseScreen();
		}
	};

	var loseGame = function loseGame() {
		gameState = 'loss';
		playMusic.stop();

		soundManager.playSound('game_over', 1, false);
		playMusic = soundManager.playSound('space_music', 1, false);

		view.lossScreen();
	};

	return {
		startGame: function startGame() {
			console.log('Starting Game!!!!');

			world = new (Function.prototype.bind.apply(_World2.default, [null].concat(_toConsumableArray(argOb))))();

			view.playScreen(world.tick(actionBuffer.bufferDump(), 0));
			if (playMusic) playMusic.stop();
			playMusic = soundManager.playSound('play_music', 1, true); //play on a loop

			gameState = 'running'; //Feels weird this isn't a function TODO
			//Start loop
			//start music
		},

		setView: function setView(newView) {
			view = newView;
		},

		setActionBuffer: function setActionBuffer(newBuffer) {
			actionBuffer = newBuffer;
		},

		setSoundManager: function setSoundManager(newManager) {
			soundManager = newManager;
		},

		keyDown: function keyDown(event) {
			if (event.key == 'space') //Super hacky, rework TODO
				togglePause();else actionBuffer.keyIn(event.key);
			//Does this filter between game actions and state actions, like pause? QUESTION TODO

			//Takes key input, and sends to ActionBuffer
		},

		tick: function tick(event) {
			if (gameState == 'running' && !PAUSED) {
				var worldState = world.tick(actionBuffer.bufferDump(), event.delta);
				view.tick(worldState);

				//SoundManager stuff, should abstract


				if (worldState.flags.BLOCKSPUN) soundManager.playSound('blockSpun'); //increase pitch the higher the block lands				
				// if (worldState.flags.DEBRISSPUN){ //spin noise is too abrassive
				// 	soundManager.playSound('debrisSpun'); //increase pitch the higher the block lands				
				// }
				if (worldState.flags.BLOCKHIT) soundManager.playSound('blockLanded', 1 + worldState.flags.BLOCKHIT / 10); //increase pitch the higher the block lands
				if (worldState.flags.ROWSDESTROYED) soundManager.playSound('destroy');
				if (worldState.flags.BLOCKSPAWNED) soundManager.playSound('woosh', 2);
				if (worldState.flags.LOSS) loseGame();
			}
			// console.log('frame');
			//Takes a tick (probably from view) with event object where event.delta = time since last tick
			//needs to update world, world should return state, then tick should call View.tick(worldOb) to draw the state
		}
	};
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _View = __webpack_require__(3);

var _View2 = _interopRequireDefault(_View);

var _Controller = __webpack_require__(1);

var _Controller2 = _interopRequireDefault(_Controller);

var _ActionBuffer = __webpack_require__(6);

var _ActionBuffer2 = _interopRequireDefault(_ActionBuffer);

var _SoundManager = __webpack_require__(7);

var _SoundManager2 = _interopRequireDefault(_SoundManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import * as consts from './constants'
var keyLayout = { //Learn how to pass arguments in this scheme TODO
  'left': { action: 'spinDebris', args: 'counterClockwise' },
  'right': { action: 'spinDebris', args: 'clockwise' },
  'down': { action: 'rushDrop', args: null },
  'q': { action: 'spinBlocks', args: 'clockwise' },
  'w': { action: 'spinBlocks', args: 'counterClockwise' },
  's': { action: 'spawnBlock', args: null },
  'y': { action: 'debug', args: null },
  'r': { action: 'spawnRow', args: null }

};

var soundSources = {
  "destroy": "./sounds/30937__aust-paul__whatever.wav",
  "woosh": "./sounds/25073__freqman__whoosh04.wav",
  "blockLanded": "./sounds/26777__junggle__btn402.mp3",
  "blockSpun": "./sounds/192273__lebcraftlp__click.wav",
  "play_music": "./sounds/384468__frankum__vintage-elecro-pop-loop.mp3",
  "space_music": "./sounds/33796__yewbic__ambience03.wav",
  "game_over": "./sounds/173859__jivatma07__j1game-over-mono.wav",
  "debrisSpun": "./sounds/15545__lagthenoggin__reload_shortened.wav"
};

var controller = new _Controller2.default([20, 15, 9]);
var view = new _View2.default();

var actionBuffer = new _ActionBuffer2.default(keyLayout);
var soundManager = new _SoundManager2.default(soundSources, view.startScreen);

controller.setView(view);
controller.setActionBuffer(actionBuffer);
controller.setSoundManager(soundManager);

view.setController(controller);

// view.startScreen();


console.log('ran ok!');

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = View;

var _Controller = __webpack_require__(1);

var _Controller2 = _interopRequireDefault(_Controller);

var _PointHelpers = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Handles drawing game World, hud, as well as start and end screens... 


//View.js --- rounTris View class

var canvas = document.getElementById('canvas');

paper.setup(canvas);

paper.view.draw(); //Seems to need only one call to begin drawing...


//Should split worldState and worldDimensions

function View() {

	var controller = null; //Pointer to the controller so we can pass view events

	var spinFlag = false; //Flags to flip if world changes so we know it needs redrawing
	var dropFlag = false;

	var boardLayer = new paper.Layer(),
	    blockLayer = new paper.Layer(),
	    debrisLayer = new paper.Layer(),
	    menuLayer = new paper.Layer();

	//GameBoard Objects
	var worldCore = null;
	var allRings = []; //list of each paper.Path.RegularPolygon that form the worlds rings

	//Game Block objects
	var blockReps = []; //Lists to collect our paper items for easy removal later
	var debrisReps = [];

	var worldColors = { //This should be read from a file or passed TODO
		coreFill: 'white', //Also clean up styles to produce no borders but also no coreners TODO
		coreStroke: 'black',
		blockFill: 'grey',
		debrisFill: 'black',
		debrisStroke: null,
		debrisStrokeWidth: .5,
		lossFill: 'red',
		lossStrokeWidth: .5
	};

	var drawBoard = function drawBoard(worldState) {

		boardLayer.activate();

		if (worldCore) {
			worldCore.remove();
			worldCore = null;
			while (allRings.length > 0) {
				allRings.pop().remove(); //remove from list and paper world. 
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
		for (var i = 1; i <= worldState.y; i++) {
			if (i > 1) {
				worldState.coreRadius += 2 * Math.PI * worldState.coreRadius / worldState.x;
			}

			var newLayer = new paper.Path.RegularPolygon({
				radius: worldState.coreRadius,
				center: paper.view.center,
				sides: worldState.x
				// strokeColor: 'black' //remove after debugging
			});

			allRings.push(newLayer);
		}

		allRings[worldState.lossHeight].strokeColor = worldColors.lossFill;
		allRings[worldState.lossHeight].strokeWidth = worldColors.lossStrokeWidth;
	};

	var updateBoard = function updateBoard(worldState) {
		if (worldState) {
			//If there's a stat object, ie change in the world
			if (worldState.flags.BLOCK) {

				blockLayer.activate();

				//Set drawing style for block
				var blockStyle = { //TODO this could be handled better maybe even using functions for values to allow for animation, would mean rethinking redraw rate.
					fillColor: worldColors.blockFill
				};

				while (blockReps.length > 0) {
					//Remove all block drawings
					blockReps.pop().remove();
				}

				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = worldState.blocks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var block = _step.value;
						var _iteratorNormalCompletion2 = true;
						var _didIteratorError2 = false;
						var _iteratorError2 = undefined;

						try {
							for (var _iterator2 = block.shape()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
								var piece = _step2.value;

								var piecePos = (0, _PointHelpers.addPoints)(block.position(), piece);

								piecePos = worldState.wrapPos(piecePos); //Make sure position is in coordinate system.

								var newBlockRep = drawAtPos(piecePos, blockStyle, worldState);
								blockReps.push(newBlockRep); //add to list to remove later
							}
						} catch (err) {
							_didIteratorError2 = true;
							_iteratorError2 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion2 && _iterator2.return) {
									_iterator2.return();
								}
							} finally {
								if (_didIteratorError2) {
									throw _iteratorError2;
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}

			if (worldState.flags.DEBRIS) {

				debrisLayer.activate();

				var debrisStyle = {
					fillColor: worldColors.debrisFill,
					strokeColor: worldColors.debrisStroke,
					strokeWidth: worldColors.debrisStrokeWidth
				};

				while (debrisReps.length > 0) {
					//Remove all block drawings
					debrisReps.pop().remove();
				} //Draw new debris:
				for (var dX = 0; dX < worldState.x; dX++) {
					for (var dY = 0; dY < worldState.y; dY++) {
						// console.log('reading x: ' + dX + ' y: '+ dY);
						if (worldState.debris[dX][dY]) {
							var newDebrisRep = drawAtPos({ x: dX, y: dY }, debrisStyle, worldState);
							debrisReps.push(newDebrisRep); //add to list to remove later
						}
					}
				}
			}
		}
	};

	var drawAtPos = function drawAtPos(drawPos, styleOb, worldState) {

		// console.log('drawAtPos');

		//This should handle the actual drawing
		var nextPos = drawPos.x + 1; //Wrapping should be handled by world?
		if (nextPos > worldState.x - 1) nextPos = 0; //necessary for drawing blocks that stradle world wrap line

		//Make shape
		var newBlockRep = new paper.Path.Line(allRings[drawPos.y].segments[drawPos.x].point, allRings[drawPos.y].segments[nextPos].point);
		newBlockRep.lineTo(allRings[drawPos.y + 1].segments[nextPos].point);
		newBlockRep.lineTo(allRings[drawPos.y + 1].segments[drawPos.x].point);
		newBlockRep.closePath();

		//Apply styles
		for (var prop in styleOb) {
			newBlockRep[prop] = styleOb[prop];
		}

		return newBlockRep;
	};

	var textButton = function textButton(propOb) {
		menuLayer.activate();

		var text = new paper.PointText({
			point: paper.view.center,
			content: propOb.content,
			fillColor: 'black',
			fontFamily: 'Courier New',
			fontWeight: 'bold',
			fontSize: propOb.size
		});

		text.position = propOb.position;
		text.onClick = propOb.callback;
	};

	var setGameOpacity = function setGameOpacity(newOpacity) {
		blockLayer.opacity = newOpacity;
		debrisLayer.opacity = newOpacity;
		boardLayer.opacity = newOpacity;
	};

	var clearAllLayers = function clearAllLayers() {
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = paper.project.layers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var layer = _step3.value;

				clearLayer(layer);
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}
	};

	var clearLayer = function clearLayer(layerToClear) {
		// console.log('before clearLayer: ', layerToClear.children)
		for (var i = layerToClear.children.length - 1; i > -1; i--) {
			layerToClear.children[i].remove();
		}
		// console.log('after clearLayer: ', layerToClear.children)
	};

	var startScreen = function startScreen() {
		clearAllLayers();
		// textButton('BEGIN', paper.view.center, controller.startGame)
		textButton({
			content: 'BEGIN',
			position: paper.view.center,
			size: 50,
			callback: controller.startGame });
	};

	return {
		tick: function tick(worldState) {
			updateBoard(worldState);
		},

		clearScreen: function clearScreen() {
			for (var i = 0; i < paper.project.activeLayer.children.length; i++) {
				paper.project.activeLayer.children[i].remove();
			}
		},

		startScreen: startScreen,

		playScreen: function playScreen(gameState) {
			clearLayer(menuLayer);
			drawBoard(gameState);
			setGameOpacity(1);
		},

		pauseScreen: function pauseScreen() {
			setGameOpacity(.2);
			textButton({
				content: 'PAUSE',
				position: paper.view.center,
				size: 50,
				callback: null });
		},

		unPauseScreen: function unPauseScreen() {
			clearLayer(menuLayer);
			setGameOpacity(1);
		},

		lossScreen: function lossScreen() {
			setGameOpacity(.5);
			// textButton('YOU LOSE! PLAY AGAIN?', paper.view.center, startScreen)
			textButton({
				content: 'YOU LOSE!',
				position: paper.view.center,
				size: 50,
				callback: startScreen });

			textButton({
				content: 'PLAY AGAIN?',
				position: (0, _PointHelpers.addPoints)(paper.view.center, [0, 40]),
				size: 25,
				callback: startScreen });
		},

		setController: function setController(newController) {
			controller = newController;
			paper.view.onKeyDown = controller.keyDown;
			paper.view.onFrame = controller.tick;
		}
	};
}

// const test = new View();
// test.startScreen();

console.log('View Class Loaded');

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = World;

var _Block = __webpack_require__(5);

var _Block2 = _interopRequireDefault(_Block);

var _PointHelpers = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//World class for rounTris.js


var BlockTypes = [{ shape: [[0, 0]], momentum: [1, -1] }, //Meteor
{ shape: [[0, -2], [0, -1], [0, 0], [0, 1]], momentum: [0, -1] }, // I
{ shape: [[-1, 0], [0, 0], [0, 1], [0, 2]], momentum: [0, -1] }, // L 
{ shape: [[-1, 0], [0, 0], [1, 0], [0, 1]], momentum: [0, -1] }, // T:
{ shape: [[-1, 0], [0, 0], [0, 1], [1, 1]], momentum: [0, -1] }, // Z      
{ shape: [[-1, 0], [0, 0], [-1, 1], [0, 1]], momentum: [0, -1] }];

function World(worldWidth, worldHeight, lossHeight) {
	//private variables / methods: one of these: preGame, playing, paused, gameWon, gameLost
	var blocksMade = 1; //Used to generate ID #

	var flags = {
		ROWSDESTROYED: false,
		BLOCKSPAWNED: false,
		DEBRISSPUN: false,
		BLOCKSPUN: false,
		BLOCKHIT: false,
		DEBRIS: false,
		BLOCK: false,
		LOSS: false

	};

	var rowsDestroyed = 0;

	var inMeteorShower = false;
	var meteorCap = 10;
	var meteorCount = 0;
	var meteorRate = .8;

	var startSpawnRate = 3; //rate at which blocks are generated
	var spawnRate = startSpawnRate;
	var dropRate = .3; //rate at which they drop

	var dropTimer = 0; //how much time has passed since the last time we dropped a block.
	var spawnTimer = 0;

	var blocks = [];

	var debrisField = []; //should init debris field

	var deadBlockIndices = []; //These are not debris but old blocks that need removal

	for (var x = 0; x < worldWidth; x++) {
		debrisField[x] = [];
		for (var y = 0; y < worldHeight; y++) {
			debrisField[x].push(0);
		}
	}

	debrisField[0][0] = 1; //This give player a sense of control before the blocks start dropping...


	//Totally Private Functions
	var dropTick = function dropTick() {

		//Clear old blocks, gives player a chance to see 
		//the complete row before it gets destroyed
		var rowsToDestroy = completedRows();
		if (rowsToDestroy.length > 0) {
			destroyRows(rowsToDestroy);
			flags.DEBRIS = true;
			flags.ROWSDESTROYED = true;
		}

		// if (blocks.length > 0)
		// console.log('dropTick, blocks: ', blocks);
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = blocks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var block = _step.value;
				//infinite falling
				if (canDrop(block)) dropBlock(block);else makeDebrisFromBlock(block);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		if (deadBlockIndices.length > 0) console.log('deadBlockIndices:', deadBlockIndices);
		clearDeadBlocks();
		dropTimer = 0; //reset the drop timer
	};

	var clearDeadBlocks = function clearDeadBlocks() {
		//refactor this for clarity TODO
		while (deadBlockIndices.length > 0) {
			blocks.splice(deadBlockIndices.pop(), 1);
		}
	};

	var canDrop = function canDrop(block) {
		//Maybe deprecate for blockFitsIn(debrisField)? TODO
		var nextPos = (0, _PointHelpers.addPoints)(block.position(), block.momentum());

		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = block.shape()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var piece = _step2.value;

				var piecePos = (0, _PointHelpers.addPoints)(nextPos, piece);

				piecePos = wrapPos(piecePos);

				// console.log(wrapPos(piecePos));

				if (debrisField[piecePos.x][piecePos.y] || piecePos.y < 0) return false;
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		return true;
	};

	var blockFitsIn = function blockFitsIn(bitField, block) {
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = block.shape()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var piece = _step3.value;


				var piecePos = (0, _PointHelpers.addPoints)(block.position(), piece);

				piecePos = wrapPos(piecePos);

				if (bitField[piecePos.x][piecePos.y] || piecePos.y < 0) return false;
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		return true;
	};

	var dropBlock = function dropBlock(block) {
		//after hit test actually drop the block

		var nextPos = wrapPos((0, _PointHelpers.addPoints)(block.position(), block.momentum()));

		block.moveTo(nextPos);
		flags.BLOCK = true; //Blocks need redraw
	};

	var makeDebrisFromBlock = function makeDebrisFromBlock(block) {

		//Should take a block and remove it, then convert each piece to debris 
		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;

		try {
			for (var _iterator4 = block.shape()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				var piece = _step4.value;

				var debrisPos = (0, _PointHelpers.addPoints)(piece, block.position());
				debrisPos = wrapPos(debrisPos); //Maps debrisPos to Coordinate system
				debrisField[debrisPos.x][debrisPos.y] = 1;
			}
		} catch (err) {
			_didIteratorError4 = true;
			_iteratorError4 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion4 && _iterator4.return) {
					_iterator4.return();
				}
			} finally {
				if (_didIteratorError4) {
					throw _iteratorError4;
				}
			}
		}

		deadBlockIndices.push(blocks.indexOf(block)); //flag block for garbage collection

		flags.BLOCKHIT = block.position().y + 1; //lets us vary playback rate of FX based on height of impact
		flags.DEBRIS = true; //Debris needs redraw
		flags.BLOCK = true; //need to remove dead blocks
	};

	var completedRows = function completedRows() {
		//Track rows to destroy
		var completeRows = [];

		for (var rowNum = 0; rowNum < worldHeight; rowNum++) {
			//go through each row
			var sum = 0;
			for (var i = 0; i < worldWidth; i++) {
				sum += debrisField[i][rowNum]; //and add all the cells at that y
			}

			// console.log('Sum ', sum, ' At Height: ', rowNum)
			if (sum == worldWidth) //if they add up to a complete row, add to our list
				completeRows.push(rowNum);
		}

		return completeRows;
	};

	var destroyRows = function destroyRows(rowNumArray) {

		//TODO this should pass destroyedDebris object to view so that we can
		//Show that transition better
		//Remove the debris from each of these rows,
		var _iteratorNormalCompletion5 = true;
		var _didIteratorError5 = false;
		var _iteratorError5 = undefined;

		try {
			for (var _iterator5 = rowNumArray[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
				var rowNum = _step5.value;

				for (var _i = worldWidth - 1; _i >= 0; _i--) {
					debrisField[_i].splice(rowNum, 1);
					rowsDestroyed++;
				}
			}

			//Add empty space on the cieling of the bit array to get back to normal.
		} catch (err) {
			_didIteratorError5 = true;
			_iteratorError5 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion5 && _iterator5.return) {
					_iterator5.return();
				}
			} finally {
				if (_didIteratorError5) {
					throw _iteratorError5;
				}
			}
		}

		for (var i = 0; i < rowNumArray.length; i++) {
			for (var _x in debrisField) {
				debrisField[_x].push(0);
			}
		}
	};

	var wrapPos = function wrapPos(pos) {
		//TODO Take away side effects

		pos = (0, _PointHelpers.pointify)(pos);

		if (pos.x < 0) pos.x = worldWidth + pos.x;else if (pos.x >= worldWidth) pos.x = pos.x - worldWidth;

		if (pos.y > worldHeight - 2) pos.y = worldHeight - 2; //allows reversing gravity? TODO

		return pos;
	};

	var spinBitField = function spinBitField(bitField, direction) {
		switch (direction) {
			case 'clockwise':
				bitField.unshift(bitField.pop());
				break;
			case 'counterClockwise':
				bitField.push(bitField.shift());
				break;
		}
	};

	var checkLoss = function checkLoss() {
		for (var _y = worldHeight; _y >= lossHeight; _y--) {
			for (var _x2 in debrisField) {
				if (debrisField[_x2][_y]) return true;
			}
		}
		return false;
	};

	var startMeteorShower = function startMeteorShower() {
		spawnRate = meteorRate;
		inMeteorShower = true;
	};

	var endMeteorShower = function endMeteorShower() {
		spawnRate = startSpawnRate;
		meteorCount = 0;
		inMeteorShower = false;
		rowsDestroyed++;
	};

	//Semi-private Functions:
	var worldActions = {

		debug: function debug() {
			console.log('blocks: ', blocks);
			console.log('deadBlockIndices: ', deadBlockIndices);
		},

		rushDrop: function rushDrop() {
			if (blocks.length > 0) {
				var lowestBlock = null;

				//Find the lowest falling block
				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = blocks[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var block = _step6.value;

						if (!lowestBlock) lowestBlock = block;else if (lowestBlock.position().y > block.position().y) lowestBlock = block;
					}

					//And drop it
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}

				while (canDrop(lowestBlock)) {
					dropBlock(lowestBlock);
				}makeDebrisFromBlock(lowestBlock);
			}
		},

		spawnTick: function spawnTick() {
			//Should take arg for block type
			console.log('METERO SHOWER? ', inMeteorShower);
			//Start a meteor shower?
			// if (rowsDestroyed%6==0)	//Meteor showers currently disabled
			// 	startMeteorShower();

			//Make meteor if we're mid meteor shower 
			if (inMeteorShower) {
				//Abstract to level manager class TODO 
				var randomX = (0, _PointHelpers.getRandomInt)(0, worldWidth);
				var startPos = [randomX, worldHeight - 2]; //need buffer of two for drawing method to stay in range

				var newBlock = new _Block2.default(startPos, BlockTypes[0], blocksMade);
				blocksMade++;
				blocks.push(newBlock);
				flags.BLOCK = true; //Blocks need redraw
				flags.BLOCKSPAWNED = true;
				spawnTimer = 0;

				meteorCount++;
				if (meteorCount == meteorCap) endMeteorShower();
			}
			//If we're not in a meteor shower
			else {
					var randomBlockType = BlockTypes[(0, _PointHelpers.getRandomInt)(1, BlockTypes.length)];
					var _randomX = (0, _PointHelpers.getRandomInt)(0, worldWidth);

					var _startPos = [_randomX, worldHeight - 2]; //need buffer of two for drawing method to stay in range

					var _newBlock = new _Block2.default(_startPos, randomBlockType, blocksMade);
					blocksMade++;
					blocks.push(_newBlock);
					flags.BLOCK = true; //Blocks need redraw
					flags.BLOCKSPAWNED = true;
					spawnTimer = 0;
				}
		},

		spawnRow: function spawnRow() {
			//for debugging only
			console.log('spawning row');
			//should spawn blocks of blockType
			// let startPos = [18, worldHeight-2]; //need buffer of two for drawing method to stay in range

			for (var i = 0; i < worldWidth; i++) {
				var startPos = [i, worldHeight - 2]; //need buffer of two for drawing method to stay in range

				var newBlock = new _Block2.default(startPos, BlockTypes.SINGLE, blocksMade);
				blocksMade++;
				blocks.push(newBlock);
				flags.BLOCK = true; //Blocks need redraw
			}
		},

		spinDebris: function spinDebris(direction) {

			//This code makes pushed blocks stick ******************

			// let debrisFieldCopy = debrisField.slice(0);


			// //rotate debris copy to the proposed direction
			// spinBitField(debrisFieldCopy, direction);

			// //Check to see what blocks would be bumped by new debris field
			// for (let block of blocks){
			// 	if (!blockFitsIn(debrisFieldCopy, block))
			// 		makeDebrisFromBlock(block) //Turn the, into debris in original field
			// }

			// spinBitField(debrisField, direction) //Now we can spin our real debris with blocks frozen to it. 

			// flags.DEBRIS=true; //need redraw


			//This code shoves falling blocks out of the way when the world rotates*****
			var modDir = 0;
			if (direction == 'clockwise') modDir = 1;else modDir = -1;

			spinBitField(debrisField, direction);

			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = blocks[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var block = _step7.value;

					if (!blockFitsIn(debrisField, block)) {
						//If any blocks are bumped
						block.moveTo(wrapPos((0, _PointHelpers.addPoints)(block.position(), [modDir, 0]))); //Move them in the same directions as we spin
						flags.BLOCK = true;
					}
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7.return) {
						_iterator7.return();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}

			flags.DEBRIS = true;
			flags.DEBRISSPUN = true;
		},

		spinBlocks: function spinBlocks(direction) {
			var _iteratorNormalCompletion8 = true;
			var _didIteratorError8 = false;
			var _iteratorError8 = undefined;

			try {
				for (var _iterator8 = blocks[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
					var block = _step8.value;

					var proposedBlock = block.rotatedClone(direction);
					if (blockFitsIn(debrisField, proposedBlock)) {
						block.rotate(direction);
						flags.BLOCK = true;
						flags.BLOCKSPUN = true;
					}
				}
			} catch (err) {
				_didIteratorError8 = true;
				_iteratorError8 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion8 && _iterator8.return) {
						_iterator8.return();
					}
				} finally {
					if (_didIteratorError8) {
						throw _iteratorError8;
					}
				}
			}
		}

		//Return interface object:
	};var hasTicked = false;
	return {

		tick: function tick(actionList, delta) {

			for (var flag in flags) {
				//Reset change flags each cycle
				flags[flag] = false;
			}

			var _iteratorNormalCompletion9 = true;
			var _didIteratorError9 = false;
			var _iteratorError9 = undefined;

			try {
				for (var _iterator9 = actionList[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
					var action = _step9.value;
					//execute actions passed
					worldActions[action.action](action.args);
				}

				//If enough time has passed drop a block
			} catch (err) {
				_didIteratorError9 = true;
				_iteratorError9 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion9 && _iterator9.return) {
						_iterator9.return();
					}
				} finally {
					if (_didIteratorError9) {
						throw _iteratorError9;
					}
				}
			}

			dropTimer += delta;
			if (dropTimer > dropRate) {
				dropTick();
			}

			spawnTimer += delta;
			if (spawnTimer > spawnRate) {
				worldActions.spawnTick();
			}

			clearDeadBlocks(); //Clear any dead block objects

			if (checkLoss()) flags.LOSS = true;

			if (!hasTicked) //draw debris on the very first tick
				flags.DEBRIS = true;

			return { //return world object to be passed to view for drawing
				x: worldWidth,
				y: worldHeight,
				flags: flags,
				debris: debrisField,
				blocks: blocks,
				lossHeight: lossHeight,
				//not sure about below items here
				coreRadius: 25,
				wrapPos: wrapPos

			};
		},

		getDebris: function getDebris() {
			return debrisField;
		},

		setState: function setState(newState) {
			state = newState;
		},

		getWorldShape: function getWorldShape() {
			return {
				x: worldWidth,
				y: worldHeight,
				lossHeight: lossHeight
			};
		}
	};
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Block;

var _PointHelpers = __webpack_require__(0);

function Block(pos, propOb, startID) {
	//{position:,shape:,momentum:}

	var _position = (0, _PointHelpers.pointify)(pos);
	var blockShape = propOb.shape;
	var _momentum = propOb.momentum;
	var _id = startID;

	//TODO put appearance details in here so that view can draw unique shapes

	return {

		id: function id() {
			return _id;
		},

		position: function position() {
			return _position;
		},

		momentum: function momentum() {
			return _momentum;
		},

		shape: function shape() {
			return blockShape;
		},

		moveTo: function moveTo(newPos) {
			newPos = (0, _PointHelpers.pointify)(newPos);
			_position = newPos;
		},

		rotatedClone: function rotatedClone(direction) {
			var newShape = [];
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = blockShape[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var piece = _step.value;

					if (direction == 'clockwise') {
						var newX = piece[1];
						var newY = -piece[0];
						newShape.push([newX, newY]);
					} else {
						var _newX = -piece[1];
						var _newY = piece[0];
						newShape.push([_newX, _newY]);
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return new Block(_position, { shape: newShape });
		},

		rotate: function rotate(direction) {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = blockShape[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var piece = _step2.value;

					if (direction == 'clockwise') {
						//Rotate coordinates
						var newX = piece[1];
						var newY = -piece[0];
						//Set old shape to rotated
						piece[0] = newX;
						piece[1] = newY;
					} else {
						var _newX2 = -piece[1];
						var _newY2 = piece[0];
						piece[0] = _newX2;
						piece[1] = _newY2;
					}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}

	};
} //Block.js
//Block class that will be used in rounTris.js Game

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = ActionBuffer;
//ActionBuffer Class 

/*Initialized with a dictionary of format

{
	'key_pressed': 'world_function_name'
}

*/

//Takes a key input and translates it into an action

//Adds action onto an Action Queue

//Makes Queue avaialble for dumping


function ActionBuffer(keyDict) {

	var buffer = [];

	this.parseKey = function (keyIn) {};

	return {
		bufferDump: function bufferDump() {
			var retBuf = buffer.slice(); //Copy internal buffer
			buffer.splice(0, buffer.length); //Clear internal buffer
			return retBuf; //return copy
		},

		keyIn: function keyIn(input) {

			// console.log('checking for key: ' + input);
			for (var key in keyDict) {
				if (key === input) {
					buffer.push(keyDict[key]);
					return 1;
				}
			}
			return 0;
		}

	};
}

// let test = new ActionBuffer(keyLayout);
// test.keyIn('b');
// test.keyIn('v');
// test.keyIn('r');

// console.log(test.bufferDump());
// console.log(test.bufferDump());

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = SoundManager;
//MusicManager.js 

//Will manage all of the music and FX for our game
//needs to maintain seperate buffers for looping music and 
//one-off sound effects


function SoundManager(soundSources, callBack) {
	//These allow a callback once sounds are loaded:
	var soundsLoaded = 0;

	function logLoad() {
		soundsLoaded += 1;
		if (soundsLoaded == Object.keys(soundSources).length) finishedLoadingSound();
	}

	function finishedLoadingSound() {
		callBack();
	}

	var soundBuffers = {};

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var context = new AudioContext();

	function loadSound(url, bufferKey) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function () {
			context.decodeAudioData(request.response, function (buffer) {
				soundBuffers[bufferKey] = buffer;
				logLoad();
			});
		};

		request.send();
	}

	for (var i in Object.keys(soundSources)) {
		//read audio files into buffers
		loadSound(soundSources[Object.keys(soundSources)[i]], Object.keys(soundSources)[i]);
	}

	return {

		playSound: function playSound(bufferKey, rate, loop) {
			//TODO rewrite with gain nodes and pitch nodes
			if (!rate) rate = 1;
			var source = context.createBufferSource(); // creates a sound source
			source.buffer = soundBuffers[bufferKey]; // tell the source which sound to play
			source.connect(context.destination); // connect the source to the context's destination (the speakers)
			source.playbackRate.value = rate;

			if (loop == true) {
				source.loop = true;
				console.log('looping ', bufferKey);
			}
			source.start(0);

			return source;
		}
	};
}

/***/ })
/******/ ]);