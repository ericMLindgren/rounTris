//Block.js
//Block class that will be used in rounTris.js Game

import {addPoint, subPoint, pointify} from './PointHelpers';


export default function Block(pos, propOb, startID){ //{position:,shape:,momentum:}

	let position = pointify(pos);
	const blockShape = propOb.shape;
	const momentum = propOb.momentum;
	const id = startID;


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
	};
}

