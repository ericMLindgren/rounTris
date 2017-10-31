//Controller.js --- Controller Object for rounTris round tetris-style game

// Handles keyboard input and calls world/view methods as appropriate
import World from "./World";
import ActionBuffer from "./ActionBuffer";
import View from "./View";
import {getCookie, setCookie} from "./CookieHelpers";

export default function Controller(argOb) {

    let highScore = 0;

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
        gameOvers[gameIndex] = 1;
        views[gameIndex].gameOverScreen();
        if (gameOvers.reduce((a,b) => a+b) ==views.length){
            endAllGames();
        }
    };

    const penalizeOthers = (dontPunishThis, amount) => {
        for (let i = 0; i<worlds.length; i++){
            if (i != dontPunishThis && !gameOvers[i]){
                // Abstract this to part of queue's interface TODO
                worlds[i].alertMessage('WARNING', 'ENEMY INCOMING!')
                worlds[i].blockQueue.messify(amount);
            }
        }
    }

    const endAllGames = () => {
        soundManager.stopMusic();


        //if multiplayer:
        //Compare scores and declare a winner, offer only the winner replay button
        for (let i = 0; i < views.length; i++){
            console.log('world getScore' , worlds[i].getScore())
            if (worlds[i].getHighScore()<=worlds[i].getScore())

                views[i].winScreen(worlds.length);
            else
                views[i].loseScreen();
        }

        if (worlds.length == 1){
            // if we beat the high score, set a cookie!
            const worldScore = worlds[0].getScore();
            console.log('one player game over')

            if (worldScore>highScore) {
                console.log('player beat high score, setting cookie')
                setCookie('rounTris_high_score', worldScore, 365*10 )
            }
        }

        
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

            if (worlds.length == 1){ // if we're in one player
                const scoreCookie = getCookie('rounTris_high_score');
                console.log('getting cookie:', scoreCookie)
                // set cookie to scoreCookie if it exists or 0
                highScore = scoreCookie ? scoreCookie : 0; 
                worlds[0].setHighScore(highScore);
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

        getControlsFor: (bufferNum) => {
            if (bufferNum > -1 && bufferNum < actionBuffers.length){
                return actionBuffers[bufferNum].toString();
            }
            else {
                console.log('actionBuffers', actionBuffers)
                throw '<CONTROLLER> - (getControlsFor) - request for actionBuffer[' + bufferNum + '] keys out of range.'
            }
        },

        keyDown: event => {
            let keyFound = false;            
            if (event.code == "Space") {togglePause();event.preventDefault();}
            else if (event.code == "KeyM") {soundManager.toggleMute();event.preventDefault();}
            else if (controllerState == "running")
                for (let actionBuffer of actionBuffers) //TODO too brute force, clean
                    if (actionBuffer.keyIn(event.code))
                        keyFound = true;

            // If we used the keystroke, prevent default;
            if (keyFound)
                event.preventDefault();
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

                    if (views.length > 1) {// If there's more than one player
                        //handle scores
                        if (world.getScore() > highScore)
                            highScore = world.getScore();



                        if (worldState.flags.ROWSDESTROYED) // and they destroyed some rows
                            penalizeOthers(i, worldState.scoreMultiplier-1); // punish everyone else based on how many rows were destroyed
                    }

                    //Loss calculatiosn:
                    if (worldState.flags.LOSS) {
                        soundManager.playSound('gameOver');
                        worldLoss(i);
                    }

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

                } else {
                    views[i].tick(null, event); //But we still get to tick animations
                }

                // Active or not, set each worlds high score to current leader:
                if (worlds.length>1){
                    console.log('setting high score to:', highScore)
                    worlds[i].setHighScore(highScore);
                }
            }
        }
    };
}
