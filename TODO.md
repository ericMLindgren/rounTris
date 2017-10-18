**** - Priorities

GRAPHICAL

-Glowing blocks with opacity animation with easing

-Different block colors and different debris colors
	this involves entirely refactoring debris so that block shape remains...

-HUD Score/levels


-Indicate next block type and general direction with graphical overlay ***



Fixes:

-Create Mirrors for L and Z blocks ****

-Randomly rotate block on spawn ****

-Anti repetition spawn order

-Occasional bug of dissappearing block on drop

-Need to abstract SoundManager better. Too intermingled with Control class




Features:

-Gravity (or Anti) - Slower movement farther out, possible solution to extra small playfield.

-Behavior Class - possibly instantiated with bpm for syncing 

-Page Manager - Should we abstract this to deal with loss screen, high scores, 

-Full Block Behaviors — not sure how to implement, can subclass block but would be nicer to create behaviors that a block 	can implement, like make blocks via new Block(position, shape, style, [behaviors])

-Level Modes  — Should be a level manager class? deals with block types, order, randomness, score/progress, difficulty

-Event Animations — (ie row destruction) via state object from World passing some history to view