//MusicManager.js

//Will manage all of the music and FX for our game
//needs to maintain seperate buffers for looping music and
//one-off sound effects

export default function SoundManager(soundSources, callBack) {
    let soundsLoaded = 0;
    const fxBuffers = {};
    const musicBuffers = [];

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    loadAllSources();


    //Create music path
    let musicSource = null;
    let MUSIC_PLAYING = false;
    const musicGain = context.createGain();
    musicGain.connect(context.destination);

    //Create fx path
    const fxGain = context.createGain();
    fxGain.connect(context.destination);

    let musicVolume = 1;
    let fxVolume = 1;

    //Loading from sources
    function loadAllSources() {
        function logLoad() {
            soundsLoaded += 1;
            if (soundsLoaded == Object.keys(soundSources).length)
                finishedLoadingSound();
        }

        function finishedLoadingSound() {
            callBack();
        }

        function loadSound(url, bufferKey, destinationBuffer) {
            const request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";

            // Decode asynchronously
            request.onload = function() {
                context.decodeAudioData(request.response, function(buffer) {
                    if (destinationBuffer instanceof Array)
                        destinationBuffer.push(buffer);
                    else
                        destinationBuffer[bufferKey] = buffer;
                    logLoad();
                });
            };

            request.send();
        }

        for (let key in soundSources) {
            //read audio files into buffers
            let destinationBuffer;
            if (key.match(/music_.+/))
                destinationBuffer = musicBuffers
            else
                destinationBuffer = fxBuffers

            loadSound(
                soundSources[key],
                key,
                destinationBuffer
            );
        }
    }

    return {
        //TODO Error handling for nonexistant sounds

        playSound: (key, rate=1) => {
            const fxSource = context.createBufferSource();
            fxSource.connect(fxGain);

            fxSource.buffer = fxBuffers[key]; // tell the source which sound to play
            fxSource.playbackRate.value = rate;

            fxSource.start(0);
        },

        playTrack: (trackNum, rate=1) => {
            if (trackNum < 0 || trackNum > musicBuffers.length-1){
                console.log('trackNum', trackNum, 'out of range');
            }

            if (MUSIC_PLAYING) //If the music is plugged in, stop 
                musicSource.stop();

            musicSource = context.createBufferSource();
            musicSource.loop = true;
            musicSource.connect(musicGain);

            musicSource.buffer = musicBuffers[trackNum]; // tell the source which sound to play
            musicSource.playbackRate.value = rate;

            musicSource.start();
            MUSIC_PLAYING = true;
        },

        stopMusic: () => { 
            if (MUSIC_PLAYING){ //If the music is plugged in, stop             
                musicSource.stop();
                MUSIC_PLAYING = false;
            }

        },

        setMusicVolume: (newVolume) => {
            musicVolume = newVolume;
            musicGain.gain = newVolume;
        },

        setFXVolume: (newVolume) => {
            fxVolume = newVolume;
            fxGain.gain = newVolume;
        },

        toggleMute: () => {
            if (musicGain.gain.value == 0)
                musicGain.gain.value = musicVolume;
            else 
                musicGain.gain.value = 0;

            if (fxGain.gain.value == 0)
                fxGain.gain.value = fxVolume;
            else 
                fxGain.gain.value = 0;
        }
    };
}
