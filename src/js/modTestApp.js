//mtestApp.js
console.log('test');
require('babel-core/register');

let test = require('./modtest.js')

console.log(test.generateRandom());