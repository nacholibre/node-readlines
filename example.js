'use strict';

var lineByLine = require('./readlines.js');
var liner = new lineByLine('./eiffel.geojson');

var line;
var lineNumber = 0;
while (line = liner.next()) {
    console.log('Line ' + lineNumber + ': ' + line.toString('ascii'));
    lineNumber++;
}

console.log('end of line reached');
