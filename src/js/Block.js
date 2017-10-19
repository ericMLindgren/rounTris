//Block.js
//Block class that will be used in rounTris.js Game

import {addPoint, subPoint, pointify, getRandomInt} from './PointHelpers';

const shapeCopy = (baseShape) => {
	let newShape = [];

	for (let piece of baseShape){
		newShape.push([piece[0], piece[1]]);
	}
	console.log()
	return newShape;
}

export default function Block(pos, shape, idNum){ //{position:,shape:,momentum:}

	let position = pointify(pos);
	
	
	const momentum = [0,-1];
	const id = idNum;
	const blockShape = shapeCopy(shape);
	console.log('inited with shape:', blockShape);

	const rotate = (direction) => {
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
	};


	// for (let i = 0; i < getRandomInt(0,5); i++)
	// {
	// 	console.log('randomizing block')
	// 	rotate() //randomize starting shape
	// }

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

			return new Block(position, {shape: newShape}); 
		},

		rotate: rotate,

		
	};
}

