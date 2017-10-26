//World class for rounTris.js

import { Block, BlockBehaviors } from "./Block";

import { addPoints, subPoints, pointify, getRandomInt, arraysEqual } from "./PointHelpers";

const BLOCKSHAPES = [
    [[0, -1], [0, 0], [0, 1], [0, 2]], // I
    [[-1, 0], [0, 0], [0, 1], [0, 2]], // L
    [[-1, 0], [0, 0], [1, 0], [0, 1]], // T
    [[-1, 0], [0, 0], [0, 1], [1, 1]], // Z
    [[-1, 0], [0, 0], [-1, 1], [0, 1]] // O
];


const makeRandomBlock = () => {
    let randomShape = BLOCKSHAPES[getRandomInt(0, BLOCKSHAPES.length)];
    let newBlock = new Block(randomShape);

    const coin = getRandomInt(0,2);
    if (coin%2)
        newBlock.addBehavior([BlockBehaviors.chameleon, BlockBehaviors.dropzig]);
    else
        newBlock.addBehavior([BlockBehaviors.glow]);
    newBlock.randomize();
    return newBlock;
}

const blocksHaveSameBaseShape = (b1, b2) => {
    if (arraysEqual(b1.baseShape(), b2.baseShape()))
        return true;
    return false;
}

const BlockGenQueue = (maxLength) => {
    //Should mantain a queue of blocks, enforcing repetition rules,
    let blockList = [];

    const fillQueue = () => {
        // while queue length is less then queue length
        while (blockList.length < maxLength){
            let newBlock = makeRandomBlock();

            // if thats the same as the last block, make another randomBlock
            while (blockList.length > 0 && blocksHaveSameBaseShape(newBlock, blockList[blockList.length-1])){
                newBlock = makeRandomBlock();
            }
            blockList.push(newBlock);
        }
    }

    fillQueue(); // populate queue initially

    return {
        // return a list of the blocks, used by preview
        contents: blockList,

        // dequeue and return, used for block spawning. 
        getNext: () => {
            let retBlock = blockList.shift();
            fillQueue();
            return retBlock;
        }
    }
}


export default function World(worldWidth, worldHeight, lossHeight) {
    //TODO Abstract this stuff
    let score = 0;
    let pointsForBlockLand = 75;
    let pointsForRowCompleted = 1000;
    let scoreMultiplier = 1;

    const flags = {
        ROWSDESTROYED: false,
        BLOCKSPAWNED: false,
        DEBRISSPUN: false,
        BLOCKSPUN: false,
        BLOCKHIT: false,
        LOSS: false
    };

    let ALERTS = [];
    let NEW_BLOCKS = [];

    const blockQueue = new BlockGenQueue(3);

    let inMeteorShower = false;
    let meteorCap = 10;
    let meteorCount = 0;
    let meteorRate = 0.8;

    let startSpawnRate = 4; //rate at which blocks are generated
    let spawnRate = startSpawnRate; // Allows temporary shifts in spawn rate with chance to return to baseline
    let dropRate = 0.3; //rate at which they drop

    let dropTimer = 0; //how much time has passed since the last time we dropped a block.
    let spawnTimer = 0;

    const blocks = [];

    const debrisField = []; //should init debris field

    let deadBlocks = []; //These are not debris but old blocks that need removal

    for (let x = 0; x < worldWidth; x++) {
        debrisField[x] = [];
        for (let y = 0; y < worldHeight; y++) {
            debrisField[x].push(0);
        }
    }

    debrisField[0][0] = 1; //This give player a sense of control before the blocks start dropping...

    //Totally Private Functions
    const dropTick = () => {
        //Clear rows completed last tick, gives player a chance to see
        //the complete row before it gets destroyed
        let rowsToDestroy = completedRows();
        if (rowsToDestroy.length > 0) {
            destroyRows(rowsToDestroy);
        }

        for (let block of blocks) {
            if (canFly(block)) flyBlock(block);
            if (canDrop(block)) dropBlock(block);
            else if (flags.DEBRISSPUN == false) //lets player slide a little before block sticks
                makeDebrisFromBlock(block);
        }

        clearDeadBlocks(); //Clear any dead block objects

        dropTimer = 0; //reset the drop timer
    };

    const clearDeadBlocks = () => {
        for (let deadBlock of deadBlocks){
            blocks.splice(blocks.indexOf(deadBlock),1);
        }

        deadBlocks = [];
    };

    // TODO more elegant combination of fly and drop:
    const canFly = (block) => {
        //Maybe deprecate for blockFitsIn(debrisField)? TODO        
        let nextPos = addPoints(block.position(), [block.momentum().x,0]);

        for (let piece of block.shape()) {
            let piecePos = addPoints(nextPos, piece);

            piecePos = wrapPos(piecePos);
            // console.log('live blocks', blocks)
            if (debrisField[piecePos.x][piecePos.y] || piecePos.y < 0){
                // console.log('canDrop failure by blockID:',block)
                return false;
            }

        }

        return true;
    };

    const canDrop = (block) => {
        //Maybe deprecate for blockFitsIn(debrisField)? TODO
        let nextPos = addPoints(block.position(), [0,block.momentum().y]);

        for (let piece of block.shape()) {
            let piecePos = addPoints(nextPos, piece);

            piecePos = wrapPos(piecePos);
            // console.log('live blocks', blocks)
            if (debrisField[piecePos.x][piecePos.y] || piecePos.y < 0){
                // console.log('canDrop failure by blockID:',block)
                return false;
            }

        }

        return true;
    };

    const blockFitsIn = function(bitField, block) {
        for (let piece of block.shape()) {
            let piecePos = addPoints(block.position(), piece);

            piecePos = wrapPos(piecePos);

            if (bitField[piecePos.x][piecePos.y] || piecePos.y < 0)
                return false;
        }

        return true;
    };

    const flyBlock = function(block) {
        //For horizontal movement of blocks
        let nextPos = wrapPos(addPoints(block.position(), [block.momentum().x,0]));

        block.moveTo(nextPos);
    };

    const dropBlock = function(block) {
        //after hit test actually drop the block

        let nextPos = wrapPos(addPoints(block.position(), [0,block.momentum().y]));

        block.moveTo(nextPos);
    };

    const makeDebrisFromBlock = function(block) {
        //Should take a block and remove it, then convert each piece to debris
        for (let piece of block.shape()) {
            let debrisPos = addPoints(piece, block.position());
            debrisPos = wrapPos(debrisPos); //Maps debrisPos to Coordinate system
            debrisField[debrisPos.x][debrisPos.y] = 1;
        }

        deadBlocks.push(block); //flag block for garbage collection

        scorePoints(pointsForBlockLand);

        flags.BLOCKHIT = block.position().y + 1; //lets us vary playback rate of FX based on height of impact
    };

    const completedRows = function() {
        //Track rows to destroy
        let completeRows = [];

        for (let rowNum = 0; rowNum < worldHeight; rowNum++) {
            //go through each row
            let sum = 0;
            for (let i = 0; i < worldWidth; i++) {
                sum += debrisField[i][rowNum]; //and add all the cells at that y
            }

            if (sum == worldWidth)
                //if they add up to a complete row, add to our list
                completeRows.push(rowNum);
        }

        return completeRows;
    };

    const destroyRows = rowNumArray => {
        flags.ROWSDESTROYED = true;

        //TODO this should pass destroyedDebris object to view so that we can
        //Show that transition better
        //Remove the debris from each of these rows,
        for (let rowNum of rowNumArray) {
            for (let i = worldWidth - 1; i >= 0; i--) {
                debrisField[i].splice(rowNum, 1);
            }
            scorePoints(pointsForRowCompleted);
            scoreMultiplier++;
        }

        //Add empty space on the cieling of the bit array to get back to normal.
        for (let i = 0; i < rowNumArray.length; i++) {
            for (let x in debrisField) {
                debrisField[x].push(0);
            }
        }
    };

    const wrapPos = pos => {
        //TODO Take away side effects

        pos = pointify(pos);

        if (pos.x < 0) pos.x = worldWidth + pos.x;
        else if (pos.x >= worldWidth) pos.x = pos.x - worldWidth;

        if (pos.y > worldHeight - 2) pos.y = worldHeight - 2; //allows reversing gravity? TODO

        return pos;
    };

    const spinBitField = function(bitField, direction) {
        switch (direction) {
            case "clockwise":
                bitField.unshift(bitField.pop());
                break;
            case "counterClockwise":
                bitField.push(bitField.shift());
                break;
        }
    };

    const checkLoss = () => {
        for (let y = worldHeight; y >= lossHeight; y--) {
            for (let x in debrisField) {
                if (debrisField[x][y]) return true;
            }
        }
        return false;
    };

    const scorePoints = amount => {
        if (scoreMultiplier > 1) {
            ALERTS.push({ message: "BONUS!!!", type: "reward" });
        }
        score += amount * scoreMultiplier;
    };

    const randomDropCoord = () => {
        const randomX = getRandomInt(0, worldWidth);
        let startPos = [randomX, worldHeight - 2]; //need buffer of two for drawing method to stay in range
        return startPos;
    };

    const putQueueBlockIntoWorld = () => {
        
        let newBlock = blockQueue.getNext();
        newBlock.moveTo(randomDropCoord());
        
        blocks.push(newBlock);
        NEW_BLOCKS.push(newBlock); //TODO redundant

    };

    //Semi-private Functions:
    const worldActions = {
        debug: () => {
            // console.log("blocks: ", blocks);
            console.log("new blocks: ", NEW_BLOCKS);
            // console.log("deadBlocks: ", deadBlocks);
        },

        rushDrop: () => {
            if (blocks.length > 0) {
                let lowestBlock = null;

                //Find the lowest falling block
                for (let block of blocks) {
                    if (!lowestBlock) lowestBlock = block;
                    else if (lowestBlock.position().y > block.position().y)
                        lowestBlock = block;
                }

                //And drop it

                while (canDrop(lowestBlock)) dropBlock(lowestBlock);

                //and destroy it
                makeDebrisFromBlock(lowestBlock);
                clearDeadBlocks();

                //If there's no blocks, drop one
                if (blocks.length<2)
                    worldActions.spawnTick();
            }
        },

        spawnTick: () => {
            putQueueBlockIntoWorld();
            flags.BLOCKSPAWNED = true;
            spawnTimer = 0;
        },

        spinDebris: direction => {
            let modDir = 0;
            if (direction == "clockwise") modDir = 1;
            else modDir = -1;

            spinBitField(debrisField, direction);

            for (let block of blocks) {
                if (!blockFitsIn(debrisField, block)) {
                    //If any blocks are bumped
                    block.moveTo(
                        wrapPos(addPoints(block.position(), [modDir, 0]))
                    ); //Move them in the same directions as we spin
                }
            }

            flags.DEBRISSPUN = true;
        },

        spinBlocks: direction => {
            //this is somehow effecting other blocks than those intended? BUG
            for (let block of blocks) {
                let proposedBlock = block.rotatedClone(direction);
                if (blockFitsIn(debrisField, proposedBlock)) {
                    block.rotate(direction);
                    flags.BLOCKSPUN = true;
                }
            }
        }
    };

    //Return interface object:
    let hasTicked = false;
    return {
        tick: (actionList, event) => {
            //Reset trackers
            scoreMultiplier = 1;
            ALERTS = [];
            NEW_BLOCKS = [];
            const delta = event.delta

            for (let flag in flags) {
                if (flag != 'DEBRISSPUN')
                    flags[flag] = false;
            }

            for (let action of actionList) {
                worldActions[action.action](action.args);
            }

            dropTimer += delta;
            if (dropTimer > dropRate) {
                dropTick();
                flags.DEBRISSPUN = false;
                
            }

            spawnTimer += delta;
            if (spawnTimer > spawnRate) {
                worldActions.spawnTick();
            }

            if (checkLoss()) flags.LOSS = true;

            if (!hasTicked) {
                //Spawn a block immediately, but just the first tick
                worldActions.spawnTick();
                dropTick();
                hasTicked = true;
            }

            const worldState = {
                //return world object to be passed to view for drawing
                x: worldWidth,
                y: worldHeight,
                flags: flags,
                debris: debrisField,
                blocks: blocks,
                lossHeight: lossHeight,
                coreRadius: 25,
                wrapPos: wrapPos,
                score: score,
                alerts: ALERTS,
                newBlocks: NEW_BLOCKS,
                blockQueue: blockQueue
            };

            // Let world blocks express behaviors
            for (let block of blocks)
                block.tick(event, worldState);

            // Let preview blocks express behaviors
            for (let block of blockQueue.contents)
                block.tick(event, worldState);

            return worldState
        },

        getDebris: () => {
            return debrisField;
        },

        setState: newState => {
            state = newState;
        },

        getWorldShape: () => {
            return {
                x: worldWidth,
                y: worldHeight,
                lossHeight: lossHeight
            };
        }
    };
}
