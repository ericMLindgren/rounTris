
// import * as consts from './constants'
import View from './View';
import Controller from './Controller';
import World from './World';
import ActionBuffer from './ActionBuffer';


const controller = new Controller();
const world = new World(20,15,8);
const view = new View();

const keyLayout = { //Learn how to pass arguments in this scheme TODO
	'left' : {action: 'spinDebris', args:'counterClockwise'},
	'right' : {action: 'spinDebris', args:'clockwise'},
	'q' : {action: 'spinBlocks', args:'clockwise'},
	'w' : {action: 'spinBlocks', args:'counterClockwise'},
	's' : {action: 'spawnBlock', args:null},
	'y' : {action: 'debug', args:null},
	'r' : {action: 'spawnRow', args:null},

}

const actionBuffer = new ActionBuffer(keyLayout);


controller.setView(view);
controller.setWorld(world);
controller.setActionBuffer(actionBuffer);

view.setWorld(world);

view.setWorldShape(world.getWorldShape()); //Necessary to get dimensions for drawing
										   //deprecate! TODO


view.setController(controller);

view.startScreen();


console.log('ran ok!');