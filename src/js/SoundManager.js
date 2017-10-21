//MusicManager.js 

//Will manage all of the music and FX for our game
//needs to maintain seperate buffers for looping music and 
//one-off sound effects
 const MUTE = false // DEBUG ONLY

export default function SoundManager(soundSources, callBack) {
	//These allow a callback once sounds are loaded:
	let soundsLoaded = 0;

	function logLoad(){
		soundsLoaded += 1;
		if (soundsLoaded==Object.keys(soundSources).length)
			finishedLoadingSound();
	}

	function finishedLoadingSound(){
		callBack(); 
	}
	
	var soundBuffers = {};

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var context = new AudioContext();

	function loadSound(url,bufferKey) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function() {
			context.decodeAudioData(request.response, function(buffer) {
				soundBuffers[bufferKey] = buffer;
				logLoad();
			});
		};

		request.send();
	}


	for (var i in Object.keys(soundSources)){ //read audio files into buffers
	    loadSound(soundSources[Object.keys(soundSources)[i]],Object.keys(soundSources)[i]);
	}

	return {

		playSound : (bufferKey, rate, loop) => {//TODO rewrite with gain nodes and pitch nodes

			if (!rate) rate = 1;
			var source = context.createBufferSource(); // creates a sound source
			source.buffer = soundBuffers[bufferKey];   // tell the source which sound to play
			source.connect(context.destination);       // connect the source to the context's destination (the speakers)
			source.playbackRate.value = rate;
			
			if (loop == true) {
			  	source.loop = true;
			}

			if (!MUTE)
				source.start(0);

			return source;
		}                                
	};
}