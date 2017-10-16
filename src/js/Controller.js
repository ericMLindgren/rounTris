//Controller.js --- Controller Object for rounTris round tetris-style game

// Handles keyboard input and calls world/view methods as appropriate
import World from './World';


export default function Controller(argOb) { //Controller is initialized with dimensions of the world
	let view = null;
	let world = null;
	let actionBuffer = null;
	let soundManager = null;

	let playMusic = null;

	let gameState = 'stopped'
	let PAUSED = false;


	const togglePause = () => {
		console.log('PAUSE/UNPAUSE');
		PAUSED = !PAUSED;

		if (PAUSED)
			view.pauseScreen();
		else
			view.unPauseScreen();
	};

	const loseGame = () => {
		gameState = 'loss';
		soundManager.playSound('end_music', 1, true)

		playMusic.stop();
		view.lossScreen();
	}

	return {
		startGame: () => {
			console.log('Starting Game!!!!');

			world = new World(...argOb);

			view.playScreen(world.tick(actionBuffer.bufferDump(), 0));
			playMusic = soundManager.playSound('play_music', 1, true); //play on a loop

			gameState = 'running'; //Feels weird this isn't a function TODO
			//Start loop
			//start music
		},

		setView: (newView) => {
			view = newView;
		},

		setActionBuffer: (newBuffer) => {
			actionBuffer = newBuffer;
		},

		setSoundManager: (newManager) => {
			soundManager = newManager;
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


				//SoundManager stuff, should abstract

				
				if (worldState.flags.BLOCKSPUN)
					soundManager.playSound('blockSpun'); //increase pitch the higher the block lands				
				if (worldState.flags.BLOCKHIT)
					soundManager.playSound('blockLanded', 1+worldState.flags.BLOCKHIT/10) //increase pitch the higher the block lands
				if (worldState.flags.ROWSDESTROYED)
					soundManager.playSound('destroy')
				if (worldState.flags.BLOCKSPAWNED)
					soundManager.playSound('woosh', 2)
				if (worldState.flags.LOSS)
					loseGame();
			
			}
			// console.log('frame');
			//Takes a tick (probably from view) with event object where event.delta = time since last tick
			//needs to update world, world should return state, then tick should call View.tick(worldOb) to draw the state

		}
	}
}
