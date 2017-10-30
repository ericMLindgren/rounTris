// import * as consts from './constants'
import {keyLayouts} from "./KeyLayouts";
import {soundSources} from "./SoundSources"
import View from "./View";
import Controller from "./Controller";
import SoundManager from "./SoundManager";

//TODO have controller handle this
// const views = [new View('canvas1')]; //TODO

// const views = [new View('canvas1'), new View('canvas2'),new View('canvas3'), new View('canvas4')]; //TODO

const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 600;
const CANVAS_COLOR = 'ghostwhite';

const canvases = [];

const playerCount = document.getElementById('playerCount');

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {gameInit(playerCount.value)})

const createViews = function(howmany) {
    //Remove old views if there are any...

    while (canvases.length>0){
        canvases.pop().remove();
    }

    const retViews = [];
    for (let i = 0; i<howmany; i++){
        const thisCanvas = document.createElement('CANVAS');
        thisCanvas.id = 'CANVAS' + i;

        //Set width and height
        thisCanvas.style.width = CANVAS_WIDTH+'px';
        thisCanvas.style.height = CANVAS_HEIGHT+'px';
        thisCanvas.style.margin = '20px';
        thisCanvas.style.backgroundColor = CANVAS_COLOR;

        canvases.push(thisCanvas);
        document.body.appendChild(thisCanvas);

        const thisView = new View(thisCanvas.id);
        retViews.push(thisView);
    }
    return retViews;
}


const gameInit = function(howmany) {
    const views = createViews(howmany);
    const controller = new Controller({
        views: views,
        keyLayouts: keyLayouts,
        worldDimensions:[20, 15, 9]
    });
    document.addEventListener("keydown", controller.keyDown) // Make sure controller gets att key presses


    // TODO would like to handle this in controller but lack of 'this' object is confusing
    for (let view of views){
        view.setController(controller)
    }

    const soundManager = new SoundManager(soundSources, controller.doneLoading);
    controller.setSoundManager(soundManager);
}