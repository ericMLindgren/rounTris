//Controller.js --- Controller Object for rounTris round tetris-style game

// Handles keyboard input and calls world/view methods as appropriate


const Controller = function() { //Initialize Controller with refreneces to what it controls or just point later?
	const keyDown = function () { 
		//Does this filter between game actions and state actions, like pause? QUESTION TODO

		//Takes key input, and sends to ActionBuffer
	}

	const tick = function(event) {
		//Takes a tick (probably from view) with event object where event.delta = time since last tick
		//needs to update world, world should return state, then tick should call View.tick(worldOb) to draw the state

	}
}
