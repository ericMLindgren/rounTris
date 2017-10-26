//View.js --- rounTris View class

import Controller from "./Controller";
import { addPoints, subPoints, pointify } from "./PointHelpers";

//Handles drawing game World, hud, as well as start and end screens...

const canvas = document.getElementById("canvas");

paper.setup(canvas);

paper.view.draw();

export default function View() {
    let controller = null; //Pointer to the controller so we can pass view events

    let spinFlag = false; //Flags to flip if world changes so we know it needs redrawing
    let dropFlag = false;

    let loadingLogo = null;

    const passiveAnimationList = {};

    const boardLayer = new paper.Layer(),
        blockLayer = new paper.Layer(),
        blockPreviewLayer = new paper.Layer(),
        debrisLayer = new paper.Layer(),
        menuLayer = new paper.Layer(),
        HUDLayer = new paper.Layer();

    //GameBoard Objects TODO Deprecate these in favor of layers for all tasks
    let worldCore = null;
    const allRings = []; //list of each paper.Path.RegularPolygon that form the worlds rings

    //Game Block objects TODO Deprecate these in favor of layers for all tasks
    const blockReps = []; //Lists to collect our paper items for easy removal later
    const debrisReps = [];

    const worldColors = {
        //This should be read from a file or passed TODO
        coreFill: "white", //Also clean up styles to produce no borders but also no coreners TODO
        coreStroke: "black",
        blockFill: "grey",
        debrisFill: "black",
        debrisStroke: null,
        debrisStrokeWidth: 0.5,
        lossFill: "red",
        lossStrokeWidth: 0.5
    };

    const drawBoard = worldState => {
        boardLayer.activate();

        if (worldCore) {
            worldCore.remove();
            worldCore = null;
            while (allRings.length > 0) {
                allRings.pop().remove(); //remove from list and paper world.
            }
        }

        //Make Core
        worldCore = new paper.Path.RegularPolygon({
            radius: worldState.coreRadius,
            center: paper.view.center,
            sides: worldState.x,
            fillColor: worldColors.coreFill,
            strokeColor: worldColors.coreStroke,
            opacity: 1
        });

        //Make outer board
        for (let i = 1; i <= worldState.y; i++) {
            if (i > 1) {
                worldState.coreRadius +=
                    2 * Math.PI * worldState.coreRadius / worldState.x;
            }

            const newLayer = new paper.Path.RegularPolygon({
                radius: worldState.coreRadius,
                center: paper.view.center,
                sides: worldState.x
            });

            allRings.push(newLayer);
        }

        allRings[worldState.lossHeight].strokeColor = worldColors.lossFill;
        allRings[worldState.lossHeight].strokeWidth =
            worldColors.lossStrokeWidth;

        //Create a passive animation for pulsating barrier
        passiveAnimationList["lossHeightPulse"] = event => {
            allRings[worldState.lossHeight].strokeWidth =
                Math.sin(event.time * 7.5) * 0.5 + 1;
        };
    };

    const updateBoard = worldState => {
        // If we don't have a board yet, draw one
        if (boardLayer.children.length == 0)
            drawBoard(worldState);

        // if (worldState) {
            //If there's a stat object, ie change in the world
            if (worldState.flags.BLOCK) {
                blockLayer.activate();

                

                while (blockReps.length > 0) {
                    //Remove all block drawings
                    blockReps.pop().remove();
                }

                for (let block of worldState.blocks) {

                    //Set drawing style for block
                    const blockStyle = block.style;

                    for (let piece of block.shape()) {
                        let piecePos = addPoints(block.position(), piece);

                        piecePos = worldState.wrapPos(piecePos); //Make sure position is in coordinate system.

                        const newBlockRep = drawAtPos(
                            piecePos,
                            blockStyle,
                            worldState
                        );
                        blockReps.push(newBlockRep); //add to list to remove later
                    }
                }
            }

            if (worldState.flags.DEBRIS) {
                debrisLayer.activate();

                const debrisStyle = {
                    fillColor: worldColors.debrisFill,
                    strokeColor: worldColors.debrisStroke,
                    strokeWidth: worldColors.debrisStrokeWidth
                };

                while (
                    debrisReps.length > 0 //Remove all block drawings
                )
                    debrisReps.pop().remove();

                //Draw new debris:
                for (let dX = 0; dX < worldState.x; dX++) {
                    for (let dY = 0; dY < worldState.y; dY++) {
                        if (worldState.debris[dX][dY]) {
                            const newDebrisRep = drawAtPos(
                                { x: dX, y: dY },
                                debrisStyle,
                                worldState
                            );
                            debrisReps.push(newDebrisRep); //add to list to remove later
                        }
                    }
                }
            }



            //Draw block previews:

            const rootPos = new paper.Point(50,50);

            if (worldState.flags.BLOCKSPAWNED){
                blockPreviewLayer.activate();
                blockPreviewLayer.removeChildren();

                if (worldState.newBlocks.length > 0) {
                    drawBlockPreview({
                        block: worldState.newBlocks[0],
                        previewType: 'CURRENT',
                        position: rootPos
                    });
                }
                
                // This should draw on preview for each block in queue
                let i = 1;
                for (let block of worldState.blockQueue.contents){
                    drawBlockPreview({
                        previewType: 'FUTURE',
                        block: block,
                        position: addPoints(rootPos, [0, 70*i])
                    })
                    i++;
                }
            }
        // }
    };

    const drawBlockPreview = (args) => { // takes object with {block, position, and previewType}
        // console.log("drawBlockPreview", args)
        const pieceSize = 20;
        const bubbleColorCurrent = new paper.Color(1, .9, .9);
        const bubbleColorFuture = new paper.Color(1);

        let bgColor;
        if (args.previewType == 'FUTURE')
            bgColor = bubbleColorFuture;
        else
            bgColor = bubbleColorCurrent

        //makes individual pieces
        const smallSquare = (position) => {
            position = pointify(position);
            return paper.Path.Rectangle({
                point: position,
                size: [pieceSize, pieceSize],
                fillColor: "black",
                strokeColor: bgColor
            });
        };

        //Draws shape from piece coordinates
        let rootPos = new paper.Point(0, 0);
        const blockRep = new paper.Group();

        for (let piece of args.block.shape()) {
            let thisPos = addPoints(rootPos, [
                piece[0] * pieceSize,
                piece[1] * -pieceSize
            ]);
            blockRep.addChild(smallSquare(thisPos));
        }

        //Draws preview bubble
        const bubble = new paper.Path.RegularPolygon({
            center: args.position,
            radius: pieceSize * 3,
            sides: 6,
            fillColor: bgColor,
            strokeColor: "black"
        });

        bubble.opacity = 0.9;
        bubble.sendToBack();
        blockRep.position = bubble.position;

        //Creates a drop shadow and adds to bubble group
        const bubbleShadow = bubble.clone();
        bubbleShadow.opacity = 0.2;
        bubbleShadow.fillColor = "black";
        bubbleShadow.position = addPoints(bubbleShadow.position, [
            pieceSize / 2,
            pieceSize / 2
        ]);

        const previewGroup = new paper.Group(bubbleShadow, bubble, blockRep);
        previewGroup.scale(0.5, 0.5);
        previewGroup.myID = args.block.id;

        return previewGroup;
    };

    const drawAtPos = (drawPos, styleOb, worldState) => {
        // console.log('drawAtPos');

        //This should handle the actual drawing
        let nextPos = drawPos.x + 1; //Wrapping should be handled by world?
        if (nextPos > worldState.x - 1) nextPos = 0; //necessary for drawing blocks that stradle world wrap line

        //Make shape
        const newBlockRep = new paper.Path.Line(
            allRings[drawPos.y].segments[drawPos.x].point,
            allRings[drawPos.y].segments[nextPos].point
        );
        newBlockRep.lineTo(allRings[drawPos.y + 1].segments[nextPos].point);
        newBlockRep.lineTo(allRings[drawPos.y + 1].segments[drawPos.x].point);

        newBlockRep.closePath();

        //Apply styles
        for (let prop in styleOb) {
            newBlockRep[prop] = styleOb[prop];
        }

        return newBlockRep;
    };

    const textButton = propOb => {
        menuLayer.activate();

        const text = new paper.PointText({
            point: paper.view.center,
            content: propOb.content,
            fillColor: "black",
            fontFamily: "Courier New",
            fontWeight: "bold",
            fontSize: propOb.size
        });
        text.position = propOb.position;
        text.onClick = propOb.callback;

        return text;
    };

    const drawHUD = worldState => {
        const buffer = 20;

        HUDLayer.activate();

        HUDLayer.removeChildren();

        const button = new paper.PointText({
            point: paper.view.center,
            content: "SCORE: " + worldState.score,
            fillColor: "black",
            fontFamily: "Courier New",
            fontWeight: "bold",
            fontSize: 20
        });

        button.position = pointify([
            button.bounds.width / 2 + buffer / 1.3,
            paper.view.bounds.height - buffer
        ]);
    };

    

    const setGameOpacity = newOpacity => {
        blockLayer.opacity = newOpacity;
        debrisLayer.opacity = newOpacity;
        boardLayer.opacity = newOpacity;
        blockPreviewLayer.opacity = newOpacity;
    };

    const clearAllLayers = () => {
        for (let layer of paper.project.layers) {
            layer.removeChildren();
        }
    };

    const startScreen = () => {
        clearAllLayers();
        const beginButton = textButton({
            content: "BEGIN",
            position: paper.view.center,
            size: 50,
            callback: controller.startGame
        });

        const instructions =
            "q,w,up     - rotate blocks\nleft,right -  rotate world\ndown 	     -    drop block\nspace      -         pause\nm          -          mute\n";
        // const instructions = 'q,w - rotate blocks \nleft,right - rotate world \ndown - drop block \nspace - pause \n'

        textButton({
            content: instructions,
            position: addPoints(paper.view.center, [0, 100]),
            size: 20,
            callback: null
        });
    };

    const loadScreen = () => {
        textButton({
            content: "...LOADING SOUNDS...",
            position: paper.view.center,
            size: 25,
            callback: null
        });

        textButton({
            content: "HEADPHONES RECOMMENDED",
            position: addPoints(paper.view.center, [0, 20]),
            size: 10,
            callback: null
        });

        loadingLogo = new paper.Path.RegularPolygon({
            radius: 10,
            center: addPoints(paper.view.center, [0, 50]),
            sides: 6,
            strokeColor: "black",
            strokeWidth: 3,
            fillColor: "ghostwhite"
        });
    };

    const passiveAnimations = event => {
        for (let key in passiveAnimationList) {
            passiveAnimationList[key](event);
        }
    };

    loadScreen();

    return {
        tick: (worldState, event) => {
            if (worldState) {
                updateBoard(worldState);
                drawHUD(worldState);
            }
            passiveAnimations(event);
        },

        clearScreen: () => {
            for (
                let i = 0;
                i < paper.project.activeLayer.children.length;
                i++
            ) {
                paper.project.activeLayer.children[i].remove();
            }
        },

        startScreen: startScreen,

        playScreen: (gameState) => {
            menuLayer.removeChildren();
            updateBoard(gameState)
            // drawBoard(gameState);
            setGameOpacity(1);
        },

        pauseScreen: () => {
            setGameOpacity(0.2);
            textButton({
                content: "PAUSE",
                position: paper.view.center,
                size: 50,
                callback: null
            });
        },

        unPauseScreen: () => {
            menuLayer.removeChildren();
            setGameOpacity(1);
        },

        lossScreen: function() {
            setGameOpacity(0.5);
            textButton({
                content: "YOU LOSE!",
                position: paper.view.center,
                size: 50,
                callback: startScreen
            });

            textButton({
                content: "PLAY AGAIN?",
                position: addPoints(paper.view.center, [0, 40]),
                size: 25,
                callback: startScreen
            });
        },

        setController: newController => {
            controller = newController;
            paper.view.onKeyDown = controller.keyDown;
            paper.view.onFrame = event => {
                if (loadingLogo) loadingLogo.rotate(1);

                controller.tick(event);
            };
        }
    };
}
