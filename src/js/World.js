//World class for rounTris.js


import Block from './Block';
import {addPoints, subPoints, pointify} from './PointHelpers';


const BlockType = { //TODO would like to have blocks implement behaviors,
					//not sure what the best route for this is
	SINGLE: {shape:[[0,0]], momentum:[0,-1]},
	METEOR: {shape:[[0,0]], momentum:[1,-1]},
	ORBIT:  {shape:[[0,0]], momentum:[1,0]},
	WARP:   {shape:[[0,0]], momentum:[0,-2]},
	T:      {shape:[[-1,0],[0,0],[1,0],[0,1]], momentum:[0,-1]},
	L:      4
}


export default function World (worldWidth, worldHeight, lossHeight){
	//private variables / methods: one of these: preGame, playing, paused, gameWon, gameLost
	let blocksMade = 1; //Used to generate ID #

	const flags = {
		ROWSDESTROYED: false,
		BLOCKSPAWNED: false,
		BLOCKSPUN: false,
		BLOCKHIT : false,
		DEBRIS : false,
		BLOCK : false,
		LOSS : false

	}

	let genRate = 1; //rate at which blocks are generated
	let dropRate = .3; //rate at which they drop

	let dropTimer = 0; //how much time has passed since the last time we dropped a block.

	const blocks = [];
	
	const debrisField = []; //should init debris field

	const deadBlockIndices = []; //These are not debris but old blocks that need removal
	
	for (let x = 0; x < worldWidth ; x++){
		debrisField[x] = [];
		for (let y = 0; y < worldHeight ; y++){
			debrisField[x].push(0)
		}
	}

	debrisField[0][0] = 1; //This give player a sense of control before the blocks start dropping...
	
	

	//Totally Private Functions
	const dropTick = () => {

		//Clear old blocks, gives player a chance to see 
		//the complete row before it gets destroyed
		let rowsToDestroy = completedRows();
			if (rowsToDestroy.length > 0){
				destroyRows(rowsToDestroy);
				flags.DEBRIS = true;
				flags.ROWSDESTROYED = true
			}

		// if (blocks.length > 0)
			// console.log('dropTick, blocks: ', blocks);
		for (let block of blocks){ //infinite falling
			if (canDrop(block))
				dropBlock(block);
			else makeDebrisFromBlock(block);
		}
		if (deadBlockIndices.length>0)
			console.log('deadBlockIndices:', deadBlockIndices);
		clearDeadBlocks();
		dropTimer = 0;//reset the drop timer
	}

	const clearDeadBlocks = () => { //refactor this for clarity TODO
			while (deadBlockIndices.length>0){
				blocks.splice(deadBlockIndices.pop(),1);

			}

	}

	const canDrop = function(block){ //Maybe deprecate for blockFitsIn(debrisField)? TODO
		let nextPos = addPoints(block.position(), block.momentum()); 

		for (let piece of block.shape()){
			let piecePos = addPoints(nextPos, piece);

			piecePos = wrapPos(piecePos);

			// console.log(wrapPos(piecePos));

			if ( (debrisField[piecePos.x][piecePos.y]) || piecePos.y < 0)
				return false;
		}

		return true

	}

	const blockFitsIn = function(bitField, block){
		for (let piece of block.shape()){

			let piecePos = addPoints(block.position(), piece);

			piecePos = wrapPos(piecePos);

			if (bitField[piecePos.x][piecePos.y] || piecePos.y < 0)
				return false;
		}

		return true;
	}

	const dropBlock = function(block){
		//after hit test actually drop the block

		let nextPos = wrapPos(addPoints(block.position(),block.momentum())); 

		block.moveTo(nextPos);
		flags.BLOCK = true; //Blocks need redraw
	}

	const makeDebrisFromBlock = function(block){

		//Should take a block and remove it, then convert each piece to debris 
		for (let piece of block.shape()){
			let debrisPos = addPoints(piece, block.position());
			debrisPos = wrapPos(debrisPos) //Maps debrisPos to Coordinate system
			debrisField[debrisPos.x][debrisPos.y]=1;
		}

		deadBlockIndices.push(blocks.indexOf(block)); //flag block for garbage collection

		flags.BLOCKHIT = block.position().y+1; //lets us vary playback rate of FX based on height of impact
		flags.DEBRIS = true; //Debris needs redraw
		flags.BLOCK = true; //need to remove dead blocks

	}


	const completedRows = function(){
		//Track rows to destroy
		let completeRows = [];
		
		for (let rowNum = 0; rowNum < worldHeight; rowNum++){ //go through each row
			let sum = 0;
			for (let i = 0; i < worldWidth; i++){
				sum += debrisField[i][rowNum]; //and add all the cells at that y
			}

			// console.log('Sum ', sum, ' At Height: ', rowNum)
			if (sum == worldWidth) //if they add up to a complete row, add to our list
				completeRows.push(rowNum);

		}

		return completeRows;
	};


	const destroyRows = (rowNumArray) => {

		//TODO this should pass destroyedDebris object to view so that we can
		//Show that transition better
		//Remove the debris from each of these rows,
		for (let rowNum of rowNumArray){
			for (let i = worldWidth-1; i >= 0; i--){
				debrisField[i].splice(rowNum,1);
			} 
		}

		//Add empty space on the cieling of the bit array to get back to normal.
		for (let i = 0; i < rowNumArray.length; i++){
			for (let x in debrisField){
				debrisField[x].push(0);
			}
		}
	};

	const wrapPos = (pos) => { 
			//TODO Take away side effects

			pos = pointify(pos);


			if (pos.x < 0)
				pos.x = worldWidth + pos.x;
			else if (pos.x >= worldWidth)
				pos.x = pos.x - worldWidth;

			if (pos.y > worldHeight -2)
				pos.y = worldHeight -2 //allows reversing gravity? TODO

			return pos;
		};

	const spinBitField = function(bitField, direction){
		switch (direction){
				case 'clockwise':
					bitField.unshift(bitField.pop());
					break;
				case 'counterClockwise':
					bitField.push(bitField.shift());
					break;
			}	
	}

	const checkLoss = () => {
		for (let y = worldHeight; y >= lossHeight; y--){
			for (let x in debrisField){
				if (debrisField[x][y])
					return true
			}
		}
		return false;
	}

	//Semi-private Functions:
	const worldActions = {

		debug: () => {
			console.log('blocks: ', blocks);
			console.log('deadBlockIndices: ', deadBlockIndices);
		},


		rushDrop :() => {
			let lowestBlock = null;

			//Find the lowest falling block
			for (let block of blocks) { 
				if (!lowestBlock)
					lowestBlock = block;
				else 
					if (lowestBlock.position().y > block.position().y)
						lowestBlock = block;
			}

			//And drop it

			while (canDrop(lowestBlock))
				dropBlock(lowestBlock)

			makeDebrisFromBlock(lowestBlock);
		},

		spawnBlock : () => { //Should take arg for block type
				console.log('spawning block');
				//should spawn blocks of blockType
				// let startPos = [18, worldHeight-2]; //need buffer of two for drawing method to stay in range

				let startPos = [19, worldHeight-2]; //need buffer of two for drawing method to stay in range

				let newBlock = new Block(startPos, BlockType.T, blocksMade);
				blocksMade++;
				blocks.push(newBlock);
				flags.BLOCK = true; //Blocks need redraw
				flags.BLOCKSPAWNED = true;
		},

		spawnRow : () => { //for debugging only
				console.log('spawning row');
				//should spawn blocks of blockType
				// let startPos = [18, worldHeight-2]; //need buffer of two for drawing method to stay in range

				for (let i = 0; i < worldWidth; i++){
					let startPos = [i, worldHeight-2]; //need buffer of two for drawing method to stay in range

					let newBlock = new Block(startPos, BlockType.SINGLE, blocksMade);
					blocksMade++;
					blocks.push(newBlock);
					flags.BLOCK = true; //Blocks need redraw
				}
		},
		

		spinDebris : (direction) => { 
			
			//This code makes pushed blocks stick ******************

			// let debrisFieldCopy = debrisField.slice(0);


			// //rotate debris copy to the proposed direction
			// spinBitField(debrisFieldCopy, direction);

			// //Check to see what blocks would be bumped by new debris field
			// for (let block of blocks){
			// 	if (!blockFitsIn(debrisFieldCopy, block))
			// 		makeDebrisFromBlock(block) //Turn the, into debris in original field
			// }

			// spinBitField(debrisField, direction) //Now we can spin our real debris with blocks frozen to it. 

			// flags.DEBRIS=true; //need redraw


			//This code shoves falling blocks out of the way when the world rotates*****
			let modDir = 0;
			if (direction=='clockwise')
				modDir = 1;
			else
				modDir = -1;

			spinBitField(debrisField, direction)

			for (let block of blocks) {
				if (!blockFitsIn(debrisField, block)){ //If any blocks are bumped
					block.moveTo(wrapPos(addPoints(block.position(),[modDir,0]))) //Move them in the same directions as we spin
				}
			}

			flags.BLOCK = true;
			flags.DEBRIS = true;
		},

		spinBlocks : (direction) => {
			for (let block of blocks) {
				let proposedBlock = block.rotatedClone(direction);
				if (blockFitsIn(debrisField, proposedBlock)){
					block.rotate(direction);
					flags.BLOCK = true;
					flags.BLOCKSPUN = true;
				}
			}
		}
	}

	
	//Return interface object:
	let hasTicked = false;
	return {

		tick: (actionList, delta) => {
			
			for (let flag in flags){ //Reset change flags each cycle
				flags[flag] = false;
			}

		
			for (let action of actionList) {//execute actions passed
				worldActions[action.action](action.args);
			}

			//If enough time has passed drop a block
			dropTimer += delta;
			if (dropTimer > dropRate) {
				dropTick();
			}


			clearDeadBlocks(); //Clear any dead block objects

			if (checkLoss())
				flags.LOSS = true;

			if (!hasTicked) //draw debris on the very first tick
				flags.DEBRIS = true;

			return {	//return world object to be passed to view for drawing
					x: worldWidth,
					y: worldHeight,
					flags : flags,
					debris: debrisField,
					blocks: blocks,
					lossHeight: lossHeight,
					//not sure about below items here
					coreRadius: 25,
					wrapPos: wrapPos

			}		
		},


		getDebris: () => {
			return debrisField;
		},

		setState: (newState) => {
			state = newState;
		},

		getWorldShape: () =>
		{
			return {
				x: worldWidth,
				y: worldHeight,
				lossHeight: lossHeight
			}
		}
	}

}

