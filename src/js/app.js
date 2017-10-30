// import * as consts from './constants'
import {keyLayouts} from "./KeyLayouts";
import {soundSources} from "./SoundSources"
import View from "./View";
import Controller from "./Controller";
import SoundManager from "./SoundManager";

//TODO have controller handle this
// const views = [new View('canvas1')]; //TODO
const views = [new View('canvas2'), new View('canvas1')];
// const views = [new View('canvas1'), new View('canvas2'),new View('canvas3'), new View('canvas4')]; //TODO


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


