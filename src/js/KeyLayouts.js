// Key layouts for actionBuffers

export const keyLayouts = [	
	{
	    ArrowLeft: { action: "spinDebris", args: "counterClockwise" },
	    ArrowRight: { action: "spinDebris", args: "clockwise" },
	    ArrowDown: { action: "rushDrop", args: null },
	    ArrowUp: { action: "spinBlocks", args: "clockwise" },
	    KeyY: { action: "debug", args: null}
	},
	{
		KeyA: { action: "spinDebris", args: "counterClockwise" },
	    KeyD: { action: "spinDebris", args: "clockwise" },
	    KeyS: { action: "rushDrop", args: null },
	    KeyW: { action: "spinBlocks", args: "clockwise" },
	},
	{
	    ArrowLeft: { action: "spinDebris", args: "counterClockwise" },
	    ArrowRight: { action: "spinDebris", args: "clockwise" },
	    ArrowDown: { action: "rushDrop", args: null },
	    ArrowUp: { action: "spinBlocks", args: "clockwise" },
	    KeyY: { action: "debug", args: null}
	},
	{
		KeyA: { action: "spinDebris", args: "counterClockwise" },
	    KeyD: { action: "spinDebris", args: "clockwise" },
	    KeyS: { action: "rushDrop", args: null },
	    KeyW: { action: "spinBlocks", args: "clockwise" },
	},
];
