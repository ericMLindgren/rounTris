
import View from './View';
import Controller from './Controller';
import World from './World';



const controller = new Controller();
const world = new World();
const view = new View();



view.setController(controller);

view.startScreen();


console.log('ran ok!');