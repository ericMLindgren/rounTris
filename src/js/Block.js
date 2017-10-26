//Block.js
//Block class that will be used in rounTris.js Game

import { addPoint, subPoint, pointify, getRandomInt } from "./PointHelpers";

const shapeCopy = baseShape => {
    let newShape = [];

    for (let piece of baseShape) {
        newShape.push([piece[0], piece[1]]);
    }
    return newShape;
};

let blocksMade = 0;
function nextBlockId() {
    blocksMade++;
    return blocksMade;
}

export default function Block(shape) {
    //{position:,shape:,momentum:}

    let position = null;

    const momentum = [0, -1];
    const id = nextBlockId();
    const baseShape = shape; // deprecated
    const thisBlocksShape = shapeCopy(shape);

    //TODO put appearance details in here so that view can draw unique shapes
    const style = {
        fillColor: {red:.5, green:.5, blue:.6},
        // opacity: 1,
    }

    const rotate = (direction) => {
        for (let piece of thisBlocksShape) {
            if (direction == "clockwise") {
                //Rotate coordinates
                let newX = piece[1];
                let newY = -piece[0];

                //Set old shape to rotated
                piece[0] = newX;
                piece[1] = newY;
            } else {
                let newX = -piece[1];
                let newY = piece[0];
                piece[0] = newX;
                piece[1] = newY;
            }
        }
    };

    const mirrorAlongYAxis = () => {
        for (let piece of thisBlocksShape) {
            piece[0] = -piece[0]; //This only works if all blockshapes are oriented vertically by default;
        }
    };

    return {
        id: () => id,

        position: () => position,

        momentum: () => momentum,

        shape: () => thisBlocksShape,

        baseShape: () => baseShape,

        moveTo: newPos => {
            newPos = pointify(newPos);
            position = newPos;
        },

        rotatedClone: direction => {
            let newShape = [];
            for (let piece of thisBlocksShape) {
                if (direction == "clockwise") {
                    let newX = piece[1];
                    let newY = -piece[0];
                    newShape.push([newX, newY]);
                } else {
                    let newX = -piece[1];
                    let newY = piece[0];
                    newShape.push([newX, newY]);
                }
            }

            blocksMade--; //Don't increment total block count for these hypothetical blocks
            const retBlock = new Block(newShape);
            retBlock.moveTo(position);
            return retBlock;
        },

        rotate: rotate,

        randomize: () => {
            for (let i = 0; i < getRandomInt(0, 5); i++) { 
                rotate(); //randomize starting shape rotations
                mirrorAlongYAxis();
            }
        },

        style: style,

        tick: (event) => {
            // const redMod = getRandomInt(0,2) ? -.1 : .1;
            // const greenMod = getRandomInt(0,2) ? -.1 : .1;
            // const blueMod = getRandomInt(0,2) ? -.1 : .1;

            // style.fillColor.red += redMod;
            // style.fillColor.green += greenMod;
            style.opacity = 1 - (Math.sin(event.time*7.5) + 1)*.1;
            // console.log('Blue:', style.fillColor.blue);
        },
    };
}
