//Controller.js --- Controller Object for rounTris round tetris-style game

// Handles keyboard input and calls world/view methods as appropriate
import World from "./World";
import ActionBuffer from "./ActionBuffer";


export default function Controller(argOb) { //TODO clean up argument interface
    //Controller is initialized with dimensions of the world

    let views = argOb.views;

    let worlds = [];
    let actionBuffers = [];
    let soundManager = null;

    let gameState = "stopped";
    let PAUSED = false;

    if (views.length> argOb.keyLayouts.length)
        throw 'ERROR: not enough key configurations for number of views';

    for (let layout of argOb.keyLayouts){
        actionBuffers.push(new ActionBuffer(layout));
    }

    
    const togglePause = () => {
        if (gameState != "stopped" && gameState != "loss") {
            //Switch state
            if (gameState == "paused") {
                gameState = "running";
                soundManager.playTrack(0);
            }
            else {
                gameState = "paused";
                soundManager.stopMusic();
            }

            for (let view of views){
                if (gameState == "paused") {
                    view.pauseScreen();
                } else {
                    view.unPauseScreen();
                }
            }
        }
    };

    const loseGame = () => {
        gameState = "loss";

        soundManager.playSound("gameOver");
        soundManager.stopMusic();

        for (let view of views)
            view.lossScreen();
    };

    return {
        startGame: () => {
            while (worlds.length > 0)
                worlds.pop();
            for (let i = 0; i < views.length; i++){
                worlds.push(new World(...argOb.worldDimensions));

                views[i].playScreen(worlds[i].tick(actionBuffers[i].bufferDump(), 0));
            }
            soundManager.playTrack(0);
            gameState = "running";

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
            if (event.code == "Space") togglePause();
            else if (event.code == "KeyM") soundManager.toggleMute();
            else if (gameState == "running")
                for (let actionBuffer of actionBuffers) //TODO too brute force, clean
                    actionBuffer.keyIn(event.code);
        },

        tick: (event) => {
            for (let i = 0; i < views.length; i++){
                const view = views[i];
                const world = worlds[i];
                const actionBuffer = actionBuffers[i];


                if (gameState == "running") {
                    
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
                    if (worldState.flags.LOSS) loseGame();
                } else {
                    view.tick(null, event); //But we still get to tick animations
                }
            }
        }
    };
}
