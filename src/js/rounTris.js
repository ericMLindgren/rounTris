//main execution loop for rounTris.js

window.documentReady = function(){


	const thisWorld = new World(20,15,8)

	const thisView = new View()

	const thisController = new Controller()


	thisView.setController(thisController);

	console.log('calling startScreen')
	thisView.startScreen();

}