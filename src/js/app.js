
import * as consts from './constants'
import View from './View';
import Controller from './Controller';
import World from './World';
import ActionBuffer from './ActionBuffer';



const controller = new Controller();
const world = new World(20,15,8);
const view = new View();

const keyLayout = { //Learn how to pass arguments in this scheme TODO
	'b' : consts.spinDebris,
	'r' : 'rotateBlocks',
	's' : 'spawnBlock'
}

const actionBuffer = new ActionBuffer(keyLayout);


controller.setView(view);
controller.setWorld(world);
controller.setActionBuffer(actionBuffer);


view.setController(controller);

view.startScreen();


console.log('ran ok!');