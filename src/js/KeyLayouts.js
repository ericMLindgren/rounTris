// Key layouts for actionBuffers

export const prettierNames = {
    'spinDebris': 'Spin World',
    'spinBlocks': 'Rotate Falling Block',
    'rushDrop': 'Quick Drop',
    'ArrowLeft': 'Left Arrow',
    'ArrowRight': 'Right Arrow',
    'ArrowUp': 'Up Arrow',
    'ArrowDown': 'Down Arrow',
    'KeyA': 'A',
    'KeyD': 'D',
    'KeyS': 'S',
    'KeyW': 'W',
    'pauseMute': 'Mute / Pause',
    'spaceM': 'M / Space'
};

export const keyLayouts = [ 
    {
    	spaceM: {action: "pauseMute"},
        KeyA: { action: "spinDebris", args: "counterClockwise" },
        KeyD: { action: "spinDebris", args: "clockwise" },
        KeyS: { action: "rushDrop", args: null },
        KeyW: { action: "spinBlocks", args: "clockwise" },
    },   
    {
    	spaceM: {action: "pauseMute"},
        ArrowLeft: { action: "spinDebris", args: "counterClockwise" },
        ArrowRight: { action: "spinDebris", args: "clockwise" },
        ArrowDown: { action: "rushDrop", args: null },
        ArrowUp: { action: "spinBlocks", args: "clockwise" },
    },

    // {
    // 	spaceM: {action: "pauseMute"},
    //     ArrowLeft: { action: "spinDebris", args: "counterClockwise" },
    //     ArrowRight: { action: "spinDebris", args: "clockwise" },
    //     ArrowDown: { action: "rushDrop", args: null },
    //     ArrowUp: { action: "spinBlocks", args: "clockwise" },
    // },
    // {
    // 	spaceM: {action: "pauseMute"},
    //     KeyA: { action: "spinDebris", args: "counterClockwise" },
    //     KeyD: { action: "spinDebris", args: "clockwise" },
    //     KeyS: { action: "rushDrop", args: null },
    //     KeyW: { action: "spinBlocks", args: "clockwise" },
    // },
];
