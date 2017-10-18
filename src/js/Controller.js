//Controller.js --- Controller Object for rounTris round tetris-style game

// Handles keyboard input and calls world/view methods as appropriate
import World from './World';


export default function Controller(argOb) { //Controller is initialized with dimensions of the world
	let view = null;
	let world = null;
	let actionBuffer = null;
	let soundManager = null;

	let pauseMusic = null;
	let endMusic = null;
	let playMusic = null;

	let gameState = 'stopped';
	let PAUSED = false;


	const togglePause = () => {
		if (gameState!='stopped' && gameState!='loss'){		
			//Switch state		
			if (gameState=='paused')
				gameState='running';
			else
				gameState='paused'


			//Act on new state
			if (gameState=='paused'){
				playMusic.stop();
				pauseMusic = soundManager.playSound('space_music', 2, true);
				
				view.pauseScreen();
			}
			else{
				pauseMusic.stop();
				playMusic = soundManager.playSound('play_music', 1, true);

				view.unPauseScreen();
			}
		}
	};

	const loseGame = () => {
		gameState = 'loss';
		playMusic.stop();

		soundManager.playSound('game_over', 1, false);
		playMusic = soundManager.playSound('space_music', 1, false);

		view.lossScreen();
	}

	return {
		startGame: () => {
			console.log('Starting Game!!!!');

			world = new World(...argOb);

			view.playScreen(world.tick(actionBuffer.bufferDump(), 0));
			if (playMusic)
				playMusic.stop();
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
			if (event.key == 'space')
				togglePause();
			 else
				actionBuffer.keyIn(event.key);
		},

		tick: (event) => {
			if (gameState == 'running'){
				const worldState = world.tick(actionBuffer.bufferDump(), event.delta);
				view.tick(worldState, event);


				//SoundManager stuff, should abstract
				if (worldState.flags.BLOCKSPUN)
					soundManager.playSound('blockSpun'); //increase pitch the higher the block lands				
				// if (worldState.flags.DEBRISSPUN){ //spin noise is too abrassive
				// 	soundManager.playSound('debrisSpun'); //increase pitch the higher the block lands				
				// }
				if (worldState.flags.BLOCKHIT)
					soundManager.playSound('blockLanded', 1+worldState.flags.BLOCKHIT/10); //increase pitch the higher the block lands
				if (worldState.flags.ROWSDESTROYED)
					soundManager.playSound('destroy');
				if (worldState.flags.BLOCKSPAWNED)
					soundManager.playSound('woosh', 2);
				if (worldState.flags.LOSS)
					loseGame();
			} else if (gameState=='paused') {
				event.delta = 0; //Time doesn't pass in the world
				const worldState = world.tick([], event.delta);
				view.tick(worldState, event); //But we still get to tick animations
			}
		}
	};
}
