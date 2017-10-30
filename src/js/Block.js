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

// let blocksMade = 0;
function getIdNum() {
    // blocksMade++;
    return getRandomInt(0,10000);
}

export function Block(shape, behaviorList) {

    const behaviors = behaviorList ? behaviorList : [];

    let position = null;

    const momentum = {x:0, y:-1};
    const id = getIdNum();
    const baseShape = shape; // deprecated
    const thisBlocksShape = shapeCopy(shape);

    //TODO generalize appearance details
    const style = {
        fillColor: {red:.5, green:.5, blue:.6},
        // opacity: 1,
    }

    //This style is used by blockPreviews for mini-block appearance 
    const repStyle = {
        fillColor: 'black'
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

        junkify: () => {
            const coin1 = getRandomInt(0,2);
            const coin2 = getRandomInt(0,2);

            const amnt = getRandomInt(1,3);

            const newX = coin1 ? amnt : -amnt;
            const newY = coin2 ? amnt : -amnt;

            thisBlocksShape.push([newX,newY]);
        },

        style: style,
        repStyle: repStyle,

        tick: (event, worldState) => {
            for (let behavior of behaviors){
                behavior({
                    event: event,
                    worldState: worldState,
                    style: style,
                    repStyle: repStyle,
                    shape: thisBlocksShape,
                    momentum: momentum,
                    position: position,
                    id: id
                });
            }
        },  

        addBehavior: (newBehaviors) => {
            if (!(newBehaviors instanceof Array)){
                behaviors.push(newBehaviors);
                return;
            }

            for (let newBehavior of newBehaviors){
                behaviors.push(newBehavior);
            }
        }   
    };
}

// Behavior:
export const BlockBehaviors = {
    chameleon: (argOb) => {
        const style = argOb.style;
        const repStyle = argOb.repStyle;
        const event = argOb.event;
        const range = .25;

        const newFill = {
            red: (Math.sin(event.time*7) + 1)*range,
            green: (Math.sin(event.time*5) + 1)*range,
            blue: (Math.sin(event.time*3) + 1)*range,
        }

        style.fillColor = newFill;
        repStyle.fillColor = newFill;
    },

    dropzig: (argOb) => {
        const worldState = argOb.worldState;
        const momentum = argOb.momentum;
        const id = argOb.id;
        const position = argOb.position;

        if (position && position.y < worldState.lossHeight)
            momentum.x = id%2 ? -1 : 1;
    },

    glow: (argOb) => {
        const event = argOb.event;
        const style = argOb.style;
        const repStyle = argOb.repStyle;

        const newOpacity = 1 - (Math.sin(event.time*7.5) + 1)*.08;
        style.opacity = newOpacity;
        repStyle.opacity = newOpacity;
    },

    phase: (argOb) => {
        const event = argOb.event;
        const style = argOb.style;
        const repStyle = argOb.repStyle;
        const id = argOb.id; // used as seed to diversify phasing

        const newOpacity = (Math.sin(event.time*3+(id)) + 1)*.5;

        style.opacity = newOpacity;
        repStyle.opacity = newOpacity;
    }
}