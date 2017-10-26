//Controller.js --- Controller Object for rounTris round tetris-style game

// Handles keyboard input and calls world/view methods as appropriate
import World from "./World";

export default function Controller(argOb) { //TODO clean up argument interface
    //Controller is initialized with dimensions of the world
    let view = null;
    let world = null;
    let actionBuffer = null;
    let soundManager = null;

    let gameState = "stopped";
    let PAUSED = false;

    const togglePause = () => {
        if (gameState != "stopped" && gameState != "loss") {
            //Switch state
            if (gameState == "paused") gameState = "running";
            else gameState = "paused";

            //Act on new state
            if (gameState == "paused") {
                soundManager.stopMusic();
                view.pauseScreen();
            } else {
                soundManager.playTrack(0);
                view.unPauseScreen();
            }
        }
    };

    const loseGame = () => {
        gameState = "loss";

        soundManager.playSound("gameOver");
        soundManager.stopMusic();

        view.lossScreen();
    };

    return {
        startGame: () => {
            world = new World(...argOb);

            view.playScreen(world.tick(actionBuffer.bufferDump(), 0));
            
            soundManager.playTrack(0);

            gameState = "running"; //Feels weird this isn't a function TODO
        },

        setView: newView => {
            view = newView;
        },

        setActionBuffer: newBuffer => {
            actionBuffer = newBuffer;
        },

        setSoundManager: newManager => {
            soundManager = newManager;
        },

        keyDown: event => {
            if (event.key == "space") togglePause();
            else if (event.key == "m") soundManager.toggleMute();
            else if (gameState == "running")
                actionBuffer.keyIn(event.key);
        },

        tick: event => {
            if (gameState == "running") {
                const worldState = world.tick(
                    actionBuffer.bufferDump(),
                    event.delta
                );
                view.tick(worldState, event);

                //SoundManager stuff, should abstract
                if (worldState.flags.BLOCKSPUN)
                    soundManager.playSound("blockSpun"); //increase pitch the higher the block lands
                if (worldState.flags.BLOCKHIT)
                    soundManager.playSound(
                        "blockLanded",
                        1 + worldState.flags.BLOCKHIT / 10
                    ); //increase pitch the higher the block lands
                if (worldState.flags.ROWSDESTROYED)
                    soundManager.playSound("rowDestroyed");
                if (worldState.flags.BLOCKSPAWNED)
                    soundManager.playSound("woosh", 2);
                if (worldState.flags.LOSS) loseGame();
            } else if (gameState == "paused") {
                view.tick(null, event); //But we still get to tick animations
            }
        }
    };
}
