General:

- Present load screen while sounds buffer

- Score/levels HUD


Graphical Stuff:

- Pulsing loss height

- Glowing blocks with opacity animation with easing

- Different block colors and different debris colors
this involves entirely refactoring debris so that block shape remains intact


Fixes: 

Need to abstract SoundManager better. Too intermingled with Control class


Features: 

- Behavior Class - possibly instantiated with bpm for syncing 

- Full Block Behaviors — not sure how to implement, can subclass block but would be nicer to create behaviors that a block can implement, like make blocks via new Block(position, shape, style, [behaviors])

- Level Modes  Implement LevelManager class to deal with block types, order, randomness, score/progress, difficulty
