//Block.js
//Block class that will be used in rounTris.js Game

import {addPoint, subPoint, pointify} from './PointHelpers';


export default function Block(pos, propOb, startID){ //{position:,shape:,momentum:}

	let position = pointify(pos);
	let blockShape = null;
	let momentum = null;
	let id = startID;
	//TODO put appearance details in here so that view can draw unique shapes


	if (propOb.momentum == undefined)
		momentum = pointify([0,-1]) //Dropping at normal rate
	else
		momentum = propOb.momentum


	if (propOb.shape == undefined)
		blockShape = [[0,0],[1,0],[2,0],[3,0]];
	else
		blockShape = propOb.shape;

	return {

		id : () => id,

		position : () => position,

		momentum : () => momentum,

		shape : () => blockShape,

		moveTo: (newPos) => {
			newPos = pointify(newPos);
			position = newPos;
		},

		// transformBy: (transVec) => { //not sure if this is useful since world has to handle coordinate wrapping anyways
		// 	position = addPoint(position,transVec);
		// },

		rotatedClone: (direction) => {
			let newShape = [];
			for (let piece of blockShape){
				if (direction == 'clockwise'){
					let newX = piece[1];
					let newY = -piece[0];
					newShape.push([newX,newY]);
				}
				else {
					let newX = -piece[1];
					let newY = piece[0];
					newShape.push([newX,newY]);
				}
			}

			return new Block(position, newShape); //Expensive to create new blocks for each rotation? QUESTION
		},

		rotate : (direction) => {
			for (let piece of blockShape){
				if (direction == 'clockwise'){
					//Rotate coordinates
					let newX = piece[1];
					let newY = -piece[0];
					//Set old shape to rotated
					piece[0] = newX;
					piece[1] = newY;
				}
				else {
					let newX = -piece[1];
					let newY = piece[0];
					piece[0] = newX;
					piece[1] = newY;
				}
			}
		},


	}

}

