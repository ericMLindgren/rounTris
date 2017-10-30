//View.js --- rounTris View class

import Controller from "./Controller";
import { addPoints, subPoints, pointify } from "./PointHelpers";
import FPSLogger from "./FPSLogger";
//Handles drawing game World, hud, as well as start and end screens...

// const canvas = document.getElementById("canvas1");

// paper.setup(canvas);

// paper.view.draw();

let viewsMade = -1;
function getIdNum() {
    viewsMade++;
    return viewsMade;
}

// ViewAnimation class, if called without duration lasts forever.
const ViewAnimation = function(argOb) {
    this.action = argOb.action;
    this.callback = argOb.callback;
    this.duration = argOb.duration;
    this.age = 0

    this.isExpired = () => {
        if (this.duration==undefined)
            return false;
        return this.age>this.duration;
    };


    this.tick = argOb.action
}

export default function View(canvas) {

    canvas = document.getElementById(canvas);
    const scope = new paper.PaperScope();
    paper.setup(canvas);
    paper.view.draw();
    const grabScope = () => {paper = scope;};


    const idNum = getIdNum();
    const FPS = new FPSLogger("<VIEW "+ idNum + ">", 2);

    let controller = null; //Pointer to the controller so we can pass view events

    let spinFlag = false; //Flags to flip if world changes so we know it needs redrawing
    let dropFlag = false;

    let loadingLogo = null;

    const ongoingAnimations = [];
    const alertStatus = {};

    const boardLayer = new paper.Layer(),
        blockLayer = new paper.Layer(),
        blockPreviewLayer = new paper.Layer(),
        debrisLayer = new paper.Layer(),
        menuLayer = new paper.Layer(),
        HUDLayer = new paper.Layer();



    //GameBoard Objects TODO Deprecate these in favor of layers for all tasks
    let worldCore = null;
    const allRings = []; //list of each paper.Path.RegularPolygon that form the worlds rings

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
        ongoingAnimations.push(new ViewAnimation({
            action: (event) => {
                allRings[worldState.lossHeight].strokeWidth = Math.sin(event.time * 7.5) + 1;
            },
            callback: () => {
                ongoingAnimations.push(new ViewAnimation({
                    action: (event) => {
                        allRings[worldState.lossHeight].strokeWidth = Math.sin(event.time * 7.5) * .5 + 1;          
                    },
                    callback: null,
                    duration: null,
                }))
            },
            duration: 1
        }));
        
    };

    const updateBoard = worldState => {
        // If we don't have a board yet, draw one
        if (boardLayer.children.length == 0)
            drawBoard(worldState);

        //If there's a stat object, ie change in the world
        // if (worldState.flags.BLOCK) {
        blockLayer.activate();
        blockLayer.removeChildren();

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
            }
        }

        debrisLayer.activate();
        debrisLayer.removeChildren();

        const debrisStyle = {
            fillColor: worldColors.debrisFill,
            strokeColor: worldColors.debrisStroke,
            strokeWidth: worldColors.debrisStrokeWidth
        };

        //Draw new debris:
        for (let dX = 0; dX < worldState.x; dX++) {
            for (let dY = 0; dY < worldState.y; dY++) {
                if (worldState.debris[dX][dY]) {
                    const newDebrisRep = drawAtPos(
                        { x: dX, y: dY },
                        debrisStyle,
                        worldState
                    );
                }
            }
        }


        //Draw block previews:
        blockPreviewLayer.activate();
        blockPreviewLayer.removeChildren();

        const rootPos = new paper.Point(50,50);

        let i = 0;
        //draw colored preview for each block in the world:
        for (let block of worldState.blocks) {
            drawBlockPreview({
                block: block,
                previewType: 'CURRENT',
                position: addPoints(rootPos, [0, 100*i])
            });
            i++;                
        }
        
        // This should draw on preview for each block in queue:
        for (let block of worldState.blockQueue.contents){
            if (i > worldState.blockQueue.contents.length-1) // never draw more previews (including current) than the queue length
                break;
            drawBlockPreview({
                previewType: 'FUTURE',
                block: block,
                position: addPoints(rootPos, [0, 100*i])
            })
            i++;
        }
    };

    const drawBlockPreview = (args) => { // takes object with {block, position, and previewType}
        // TODO abstract color decisions
        const pieceSize = 30;
        const bubbleColorCurrent = new paper.Color(1, .9, .9);
        const bubbleColorFuture = new paper.Color(1);

        let bubbleBgColor;
        if (args.previewType == 'FUTURE')
            bubbleBgColor = bubbleColorFuture;
        else
            bubbleBgColor = bubbleColorCurrent

        //makes individual pieces
        const smallSquare = (position) => {
            position = pointify(position);
            return paper.Path.Rectangle({
                point: position,
                size: [pieceSize, pieceSize],
                fillColor: args.block.repStyle.fillColor, //args.block.style.fillColor,
                opacity: args.block.repStyle.opacity,
                strokeColor: bubbleBgColor
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
            fillColor: bubbleBgColor,
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
        grabScope();
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
        grabScope();
        const buffer = 20;

        HUDLayer.activate();

        HUDLayer.removeChildren();

        const scoreLabel = new paper.PointText({
            point: paper.view.center,
            content: "SCORE: " + worldState.score,
            fillColor: "black",
            fontFamily: "Courier New",
            fontWeight: "bold",
            fontSize: 20
        });

        scoreLabel.position = pointify([
            scoreLabel.bounds.width / 2 + buffer / 1.3,
            paper.view.bounds.height - buffer
        ]);

        const FPSLabel = new paper.PointText({
            point: paper.view.center,
            content: "FPS: " + FPS.FPS.toPrecision(2),
            fillColor: "black",
            fontFamily: "Courier New",
            fontWeight: "bold",
            fontSize: 20
        });

        FPSLabel.position = addPoints(paper.view.center,[0,280]);
    };

    const fadeChildren = (root, amount) => {
        if (root.fillColor){
            root.fillColor = new paper.Color(
                root.fillColor.red + amount,
                root.fillColor.green + amount,
                root.fillColor.blue + amount 
                )
        }
        if (root.children)
            for (let child of root.children)
                fadeChildren(child, amount)
    }

    const fadeGameBy = amount => {
        const layersToFade = [blockLayer,debrisLayer,boardLayer,blockPreviewLayer];
        
        for (let layer of layersToFade){

            fadeChildren(layer, amount)
        }
    };

    const onAllLayers = (action) => {
        grabScope();
        for (let layer of paper.project.layers) {
            // layer.removeChildren();
            action(layer)
        }
    };


    const startScreen = () => {
        // TODO centralize this.
        // clearAllLayers();
        onAllLayers((layer)=>{
            layer.removeChildren();
        })

        let content = 'PLAYER ' + parseInt(idNum+1) + ' READY';
        const beginButton = textButton({
            content: content,
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

    const animationTick = (event) => {
        if (loadingLogo) loadingLogo.rotate(1);

        for (let i = ongoingAnimations.length-1; i > -1; i--) {
            const anim = ongoingAnimations[i];
            anim.tick(event);
            anim.age += event.delta;
            if (anim.isExpired()){
                anim.callback();
                ongoingAnimations.splice(i,1)
            }
        }
    };

    //TODO fix Color for alert type
    //extract animation behaviors to separate functions...
    const spawnAlerts = (worldState) => {

        for (let category in worldState.alerts){
            // If we're already alerting in this category, skip it
            if (alertStatus[category])
                continue;
            // Otherwise flag that we have an alert going.
            alertStatus[category] = true; 

            alert = worldState.alerts[category];

            
            const alertAnims = { // TODO refactor these out, unnecessary overhead creating all the time just for convenience of closure
                BONUS: (event) => {
                        alertRep.fillColor = 'red';
                        // alertRep.fontSize = 25 + (Math.sin(event.time * 7.5) + 1) * 5;
                        alertRep.applyMatrix = false;
                        alertRep.scale(1.03);
                        alertRep.opacity -= .01
                },

                WARNING: (event) => {
                    alertRep.fillColor = 'red';
                    const newScale = 1 + (Math.sin(event.time * 7.5)) * .02;
                    alertRep.scale(newScale);
                }
            }

            let alertRep = textButton({
                content: alert,
                position: paper.view.center,
                size: 25,
                callback: null
            });

            ongoingAnimations.push(new ViewAnimation({
                duration: 1,
                callback: (event) => {
                    alertRep.remove();
                    alertStatus[category] = false;
                },
                action: alertAnims[category],
            }))
        }
    }

    const logLayers = () => {
        console.log('<VIEW> id:', idNum, 'logging layers...');
        console.log('boardLayer', boardLayer.children);
        console.log('blockLayer', blockLayer.children);
        console.log('blockPreviewLayer', blockPreviewLayer.children);
        console.log('debrisLayer', debrisLayer.children); 
        console.log('menuLayer', menuLayer.children); 
        console.log('HUDLayer', HUDLayer.children); 
    }
    let logTimer = 0;

    loadScreen(); //Initialize view TODO move this to Controller    

    return {
        tick: (worldState, event) => {

            FPS.frame(event.delta);

            grabScope();
            if (worldState) {
                updateBoard(worldState);
                drawHUD(worldState);
                spawnAlerts(worldState);
            }
            animationTick(event);
            // paper.draw();
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
            // fadeGameBy(0);
        },

        pauseScreen: () => {
            console.log('<VIEW> ' + idNum + ' pausing...')
            fadeGameBy(.21);
            textButton({
                content: "PAUSE",
                position: paper.view.center,
                size: 50,
                callback: null
            });
        },

        unPauseScreen: () => {
            menuLayer.removeChildren();
            fadeGameBy(-.21);
        },

        gameOverScreen: function() {

            fadeGameBy(.3);

            textButton({
                content: "YOU LOSE!",
                position: paper.view.center,
                size: 50,
                callback: startScreen
            });

            // textButton({
            //     content: "PLAY AGAIN?",
            //     position: addPoints(paper.view.center, [0, 40]),
            //     size: 25,
            //     callback: startScreen
            // });
        },

        setController: newController => {
            controller = newController;
            paper.view.onFrame = controller.tick // move this to vanilla implementation in controller or app
        },

        idNum: idNum
    };
}
