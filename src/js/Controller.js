//Controller.js --- Controller Object for rounTris round tetris-style game

// Handles keyboard input and calls world/view methods as appropriate


export default function Controller() { //Initialize Controller with refreneces to what it controls or just point later?
	let view = null;
	let world = null;
	let actionBuffer = null;

	return {
		startGame: () => {
			console.log('Starting Game!!!!');

			view.clearScreen();
			view.makeBoard();

			world.setState('playing')
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
			actionBuffer.keyIn(event.key);
			//Does this filter between game actions and state actions, like pause? QUESTION TODO

		//Takes key input, and sends to ActionBuffer

		},

		tick: (event) => {
			const worldState = world.tick(actionBuffer.bufferDump(), event.delta);
			view.tick(worldState);
			// console.log('frame');
			//Takes a tick (probably from view) with event object where event.delta = time since last tick
			//needs to update world, world should return state, then tick should call View.tick(worldOb) to draw the state

		}
	}
}
