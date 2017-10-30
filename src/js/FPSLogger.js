//FPS logger
export default class FPSLogger {
	constructor(message, calcRate){ 
		this.message = message;
		this.calcRate = calcRate;
		this.frames = 0;

		this.calcTimer = 0;
		this.FPS = 0;
	}

	frame(delta) {
		this.calcTimer += delta;
		this.frames++;

		if (this.calcTimer>this.calcRate){
			this.FPS = this.frames/this.calcTimer;
			this.calcTimer = 0; 
			this.frames = 0;

			// console.log(this.message, 'FPS:', this.FPS);
		}
	}
}

