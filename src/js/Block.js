//Block.js
//Block class that will be used in rounTris.js Game

import {addPoint, subPoint, pointify, getRandomInt} from './PointHelpers';

const shapeCopy = (baseShape) => {
	let newShape = [];

	for (let piece of baseShape){
		newShape.push([piece[0], piece[1]]);
	}
	return newShape;
}

let blocksMade = 0;
export default function Block(pos, shape){ //{position:,shape:,momentum:}
	blocksMade++;

	let position = pointify(pos);
	
	const momentum = [0,-1];
	const id = blocksMade;
	const blockShape = shapeCopy(shape);


	//TODO put appearance details in here so that view can draw unique shapes

	return {

		id : () => id,

		position : () => position,

		momentum : () => momentum,

		shape : () => blockShape,

		moveTo: (newPos) => {
			newPos = pointify(newPos);
			position = newPos;
		},

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

			blocksMade--; //Don't increment total block count for these hypothetical blocks
			return new Block(position, newShape); 
		},

		rotate:  (direction) => {
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

		mirrorAlongYAxis: () => {
			for (let piece of blockShape){
				piece[0] = -piece[0]; //This only works if all blockshapes are oriented vertically by default; 
			}
		}
	};
}

