//Controller.js --- Controller Object for rounTris round tetris-style game

// Handles keyboard input and calls world/view methods as appropriate


export default function Controller() { //Initialize Controller with refreneces to what it controls or just point later?
	let view = null;
	let world = null;
	let actionBuffer = null;

	let gameState = 'stopped'
	let PAUSED = false;


	const togglePause = () => {
		console.log('PAUSE/UNPAUSE');
		PAUSED = !PAUSED;
	};

	return {
		startGame: () => {
			console.log('Starting Game!!!!');

			view.clearScreen();
			view.makeBoard();

			gameState = 'running'; //Feels weird this isn't a function TODO
			//Start loop
			//start music
		},

		

		setView: (newView) => {
			view = newView;
		},

		setWorld: (newWorld) => {
			world = newWorld;
		},

		setActionBuffer: (newBuffer) => {
			actionBuffer = newBuffer;
		},

		keyDown: (event) => {
			if (event.key == 'space') //Super hacky, rework TODO
				togglePause();
			 else
				actionBuffer.keyIn(event.key);
			//Does this filter between game actions and state actions, like pause? QUESTION TODO

		//Takes key input, and sends to ActionBuffer

		},

		tick: (event) => {
			if (gameState == 'running' && (!PAUSED)){
				const worldState = world.tick(actionBuffer.bufferDump(), event.delta);
				view.tick(worldState);
			}
			// console.log('frame');
			//Takes a tick (probably from view) with event object where event.delta = time since last tick
			//needs to update world, world should return state, then tick should call View.tick(worldOb) to draw the state

		}
	}
}
