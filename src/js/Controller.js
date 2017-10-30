//Controller.js --- Controller Object for rounTris round tetris-style game

// Handles keyboard input and calls world/view methods as appropriate
import World from "./World";
import ActionBuffer from "./ActionBuffer";


export default function Controller(argOb) { //TODO clean up argument interface
    //Controller is initialized with dimensions of the world

    let views = argOb.views;

    let worlds = [];
    let gameOvers = [];
    let actionBuffers = [];
    let soundManager = null;


    let controllerState = "stopped";
    let PAUSED = false;

    if (views.length> argOb.keyLayouts.length)
        throw 'ERROR: not enough key configurations for number of views';

    for (let layout of argOb.keyLayouts){
        actionBuffers.push(new ActionBuffer(layout));
    }

    
    const togglePause = () => {
        if (controllerState != "stopped" && controllerState != "loss") {
            //Switch state and music
            if (controllerState == "paused") {
                controllerState = "running";
                soundManager.playTrack(0);
            }
            else {
                controllerState = "paused";
                soundManager.stopMusic();
            }

            for (let i = views.length-1; i > -1; i--){
                if (!gameOvers[i]){
                    const view = views[i];
                    if (controllerState == "paused") {
                        view.pauseScreen();
                    } else {
                        view.unPauseScreen();
                    }
                }
            }
        }
    };

    const worldLoss = (gameIndex) => {
        // controllerState = "loss";

        // soundManager.stopMusic();

        // for (let view of views){
        //     view.lossScreen();
        // }
        gameOvers[gameIndex] = 1;
        views[gameIndex].gameOverScreen();
        if (gameOvers.reduce((a,b) => a+b) ==views.length){
            endAllGames();
        }
    };

    const endAllGames = () => {
        //if multiplayer:
        //Compare scores and declare a winner, offer only the winner replay button

        //if single player show score vs high score, offer replay
    }

    return {
        startGame: () => {
            while (worlds.length > 0)
                worlds.pop();

            while (gameOvers.length > 0)
                gameOvers.pop();

            for (let i = 0; i < views.length; i++){
                worlds.push(new World(...argOb.worldDimensions));
                gameOvers.push(0);

                views[i].playScreen(worlds[i].tick(actionBuffers[i].bufferDump(), 0));
            }
            soundManager.playTrack(0);
            controllerState = "running";

        },

        markAsReady: (viewNum) => {
            // mark a view as ready,
            // if ready's == views.length
            // then start game
        },

        // Called by soundmanager after load, puts startscreen on each view
        doneLoading: () => {
            for (let view of views){
                view.startScreen()
            }
        },

        setSoundManager: newManager => {
            soundManager = newManager;
        },

        keyDown: event => {
            event.preventDefault();
            if (event.code == "Space") togglePause();
            else if (event.code == "KeyM") soundManager.toggleMute();
            else if (controllerState == "running")
                for (let actionBuffer of actionBuffers) //TODO too brute force, clean
                    actionBuffer.keyIn(event.code);
        },

        tick: (event) => {

             

            for (let i = 0; i < views.length; i++){

                if (controllerState == "running" && gameOvers[i] == 0) {

                    const view = views[i];
                    const world = worlds[i];
                    const actionBuffer = actionBuffers[i];
                    
                    const worldState = world.tick(
                        actionBuffer.bufferDump(),
                        event
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
                    if (worldState.flags.LOSS) worldLoss(i);
                } else {
                    views[i].tick(null, event); //But we still get to tick animations
                }
            }
        }
    };
}
