//ActionBuffer Class 

/*Initialized with a dictionary of format

{
	'key_pressed': 'world_function_name'
}

*/

//Takes a key input and translates it into an action

//Adds action onto an Action Queue

//Makes Queue avaialble for dumping



export default function ActionBuffer(keyDict) {

	const buffer = [];

	this.parseKey = function(keyIn){};

	return {
		bufferDump : () => {
			let retBuf = buffer.slice(); //Copy internal buffer
			buffer.splice(0,buffer.length) //Clear internal buffer
			return retBuf; //return copy
		},

		keyIn : (input) => {
			
			// console.log('checking for key: ' + input);
			for (let key in keyDict){			
				if (key === input) {
					buffer.push(keyDict[key])
					return 1;
				}
			}
			return 0;

		}

	}

}


// let test = new ActionBuffer(keyLayout);
// test.keyIn('b');
// test.keyIn('v');
// test.keyIn('r');

// console.log(test.bufferDump());
// console.log(test.bufferDump());
