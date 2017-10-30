//ActionBuffer Class

import {prettierNames} from "./KeyLayouts"

export default function ActionBuffer(keyDict) {
    const buffer = [];

    this.parseKey = function(keyIn) {};

    return {
        bufferDump: () => {
            let retBuf = buffer.slice(); //Copy internal buffer
            buffer.splice(0, buffer.length); //Clear internal buffer
            return retBuf; //return copy
        },

        keyIn: input => {
            // console.log('<ACTIONBUFFER> checking for key: ' + input + ' in dict:', keyDict);
            for (let key in keyDict) {
                if (key === input) {
                    buffer.push(keyDict[key]);
                    return 1;
                }
            }
            return 0;
        },

        toString: () => {
            let result = '';
            for (let key in keyDict){
                result += prettierNames[key] + ' - ' + prettierNames[keyDict[key].action] + '\n'; 
            }
            return result;
        }
    };
}

// let test = new ActionBuffer(keyLayouts[0]);

// console.log(test.toString());
