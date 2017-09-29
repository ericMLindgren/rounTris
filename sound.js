//Sound Stuff
window.onload = init;
function init(){
 	console.log('LOADED');
	var soundNames = [
	    "destroy",
	    "woosh",
	    "click", 
	    "play_music",
	    "end_music"
	]

	var soundFiles = [
		"./sounds/30937__aust-paul__whatever.wav",
		"./sounds/25073__freqman__whoosh04.wav",
		"./sounds/26777__junggle__btn402.mp3",
		"./sounds/384468__frankum__vintage-elecro-pop-loop.mp3",
		"./sounds/33796__yewbic__ambience03.wav"
	]

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var context = new AudioContext();

	var soundsBuffer = new BufferLoader(context,soundFiles,finishedLoading);
	soundsBuffer.load()

	// Fix up prefixing



	// var allSounds = {};
	var playSound = function(bufferKey) {//TODO rewrite with gain nodes and pitch nodes
	  var source = context.createBufferSource(); // creates a sound source
	  source.buffer = soundsBuffer[soundNames.indexOf(bufferKey)];                    // tell the source which sound to play
	  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
	  source.start(0);                           // play the source now
	                                             // note: on older systems, may have to use deprecated noteOn(time);
	}

	// function loadSound(url,bufferKey) {
	//   var request = new XMLHttpRequest();
	//   request.open('GET', url, true);
	//   request.responseType = 'arraybuffer';

	//   // Decode asynchronously
	//   request.onload = function() {
	//     context.decodeAudioData(request.response, function(buffer) {
	//       allSounds[bufferKey] = buffer;
	//     });
	//   }
	//   request.send();
	// }


	// for (var i in Object.keys(urlDict)){
	//     loadSound(urlDict[Object.keys(urlDict)[i]],Object.keys(urlDict)[i]);
	// }
 }