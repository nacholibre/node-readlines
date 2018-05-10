'use strict';

const lineByLine = require('./readlines.js');
const liner = new lineByLine('./eiffel.geojson');

let line;
let lineNumber = 0;

while (line = liner.next()) {
    console.log('Line ' + lineNumber + ': ' + line.toString('ascii'));
    lineNumber++;
}

console.log('end of line reached');
