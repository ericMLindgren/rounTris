//World class for rounTris.js
const BlockType = { //Don't know about this route.... have to think about blocks
	SINGLE: 0,
	LINE:   1,
	T:      2,
	U:      3,
	L:      4
}


//NEED BLOCK CLASS



const World = function (width, height, lossHeight){
	//private variables / methods: one of these: preGame, playing, paused, gameWon, gameLost

	const state = ''; //

	var genRate; //rate at which blocks are generated
	var dropRate; //rate at which they drop

	const blocks = []; //easier to use this.blocks QUESTION
	
	const debrisField = []; //should init debris field
	
	for (let y = 0; y < height ; y++){
		debrisField[y] = [];
		for (let x = 0; x < width ; x++){
			debrisField[y].push(0)
		}
	}

	// console.log(debrisField);

	const dropTick = function() {
		//drops all falling blocks by 1 if they can,
		//otherwise moves them to debris array

		//checks to see if this triggers loss
		//if loss then change the state
	}

	const rushDrop = function() {
		//rushes falling block to the floor
	}

	const spawnBlock = function(blockType){
		//should spawn blocks of blockType
	}

	const destroyRow = function(rowNum){
		//removes all blocks in this row and drops all debris that was higher
		//by exactly one space
	}

	const wrapX = function(xIn){
		//helper method to put x in world and facilitate coordinate wrapping
	}

	const spinDebris = function(){
		//slides all debris left or right
	}

	const rotateBlocks  = function() {
		//rotates all falling blocks
	}

	const parseAction = function(actionList){
		//This takes the actionList passed by controller and executes it
	}

	return {
		tick: (actionList, delta) => {
			for (action of actionList)
				this[action];

		},

		getDebris: () => {
			return this['debrisField'];
		}
	}

}

const world = new World(10,20,10);
console.log(world.getDebris())