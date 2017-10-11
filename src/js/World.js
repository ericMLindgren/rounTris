//World class for rounTris.js


import Block from './Block';
import {addPoint, subPoint, pointify} from './PointHelpers';


const BlockType = { //Need to include inertia as part of this
	SINGLE: {shape:[[0,0]], momentum:[0,-1]},
	METEOR: {shape:[[0,0]], momentum:[-1,-1]},
	ORBIT:   {shape:[[0,0]], momentum:[-1,0]},
	T:      2,
	U:      3,
	L:      4
}


export default function World (worldWidth, worldHeight, lossHeight){
	//private variables / methods: one of these: preGame, playing, paused, gameWon, gameLost
	
	const flags = {
		DEBRIS : false,
		BLOCK : false,

	}


	let state = 'paused'; //TODO move this to controller responsibilities.

	let genRate = 1; //rate at which blocks are generated
	let dropRate = .3; //rate at which they drop

	let dropTimer = 0; //how much time has passed since the last time we dropped a block.

	const blocks = [];
	
	const debrisField = []; //should init debris field

	const deadBlocks = []; //These are not debris but old blocks that need removal
	
	for (let x = 0; x < worldWidth ; x++){
		debrisField[x] = [];
		for (let y = 0; y < worldHeight ; y++){
			debrisField[x].push(0)
		}
	}

	// console.log(debrisField);

	//Totally Private Functions
	const dropTick = () => {
		for (let block of blocks){ //infinite falling
			if (canDrop(block))
				dropBlock(block);
			else makeDebrisFromBlock(block);
		}
		
		clearDeadBlocks();
		dropTimer = 0;//reset the drop timer
	}

	const clearDeadBlocks = () => {
		if (deadBlocks) {
			for (let blockIndex of deadBlocks){
				blocks.splice(blockIndex,1);
				deadBlocks.splice(deadBlocks.indexOf(blockIndex),1);
			}
		}

	}

	const canDrop = function(block){
		let nextPos = addPoint(block.position(), block.momentum()); 

		nextPos = wrapPos(nextPos);
		console.log("BlockID: ",  blocks.indexOf(block), " ", nextPos)
		
		console.log('--')

		if ( (!debrisField[nextPos.x][nextPos.y]) && nextPos.y > -1)
			return true
		console.log('hit');
		return false

	}

	const dropBlock = function(block){
		//after hit test actually drop the block

		block.moveTo(addPoint(block.position(),block.momentum()));
		flags.BLOCK = true; //Blocks need redraw
	}

	const makeDebrisFromBlock = function(block){

		//Should take a block and remove it, then convert each piece to debris 
		for (let piece of block.shape()){
			let debrisPos = addPoint(piece, block.position());
			debrisField[debrisPos.x][debrisPos.y]=1;
		}

		// blocks.splice(blocks.indexOf(block),1); //Remove Block from World
		deadBlocks.push(blocks.indexOf(block));

		flags.DEBRIS = true; //Debris needs redraw
		flags.BLOCK = true; //need to remove dead blocks

	}

	const hitTest= function(block){
		//Does the block contact any rubble?
	}

	const wrapPos = (pos) => { //helper method to put x in world and facilitate coordinate wrapping
			//TODO maybe broken....

			pos = pointify(pos);

			// console.log('Wrapping:');
			// console.log(pos);

			if (pos.x < 0)
				pos.x = worldWidth + pos.x;
			else if (pos.x >= worldWidth)
				pos.x = pos.x - worldWidth;

			if (pos.y > worldHeight -2)
				pos.y = worldHeight -2 //allows reversing gravity? TODO


			// console.log('To Pos:');
			// console.log(pos);

			return pos;
		};

	//Semi-private Functions:
	const worldActions = {


		rushDrop :() => {

			//While candrop doesdrop, then debris
			//rushes falling block to the floor
		},

		spawnBlock : () => { //Should take arg for block type
				console.log('spawning block');
				//should spawn blocks of blockType
				// let startPos = [18, worldHeight-2]; //need buffer of two for drawing method to stay in range

				let startPos = [18, 5]; //need buffer of two for drawing method to stay in range

				let newBlock = new Block(startPos, BlockType.ORBIT);
				blocks.push(newBlock);
				flags.BLOCK = true; //Blocks need redraw
		},
		

		destroyRow : (rowNum) => {
			//removes all blocks in this row and drops all debris that was higher
			//by eyactly one space
		},

		spinDebris : (direction) => { 
			//TODO resolve how to deal with hitting falling blocks
			switch (direction){
				case 'clockwise':
					debrisField.unshift(debrisField.pop());
					break;
				case 'counterClockwise':
					debrisField.push(debrisField.shift());
					break;
			}
			
			flags.DEBRIS=true; //need redraw
		},

		rotateBlocks : () => {
			//rotates all falling blocks
		}

	}

	
	//Return interface object:
	return {
		tick: (actionList, delta) => {
			for (let flag in flags){ //Reset change flags each cycle
				flags[flag] = false;
			}

			if (state === 'playing'){
				for (let action of actionList) {//execute actions passed
					worldActions[action.action](action.args);
				}

				//If enough time has passed drop a block
				dropTimer += delta;
				if (dropTimer > dropRate) {
					dropTick();
				}

				if (flags.DEBRIS || flags.BLOCK){ //If anything has changed
					return {	//return world object to be passed to view for drawing
							flags : flags,
							debris: debrisField,
							blocks: blocks 
					}
				}

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

