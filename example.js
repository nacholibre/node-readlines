'use strict';

var lineByLine = require('./readlines.js');

var liner = new lineByLine('./dummy_files/twoLineFile.txt');

var line;
while (line = liner.next()) {
    console.log(line.toString('ascii'));
}

console.log('end of line reached');
