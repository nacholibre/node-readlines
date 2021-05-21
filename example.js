'use strict';

const lineByLine = require('./readlines.js');

const fname = process.argv.length > 2 ? process.argv[2] : './test/fixtures/normalFile.txt';
const enc   = process.argv.length > 3 ? process.argv[3] : 'ascii';
console.log('Reading', enc, 'encoded file', fname);

const liner = new lineByLine(fname === '-' ? 0 : fname);

let line;
let lineNumber = 0;

while (line = liner.next()) {
    console.log('Line ' + lineNumber + ': ' + line.toString(enc));
    lineNumber++;
}

console.log('end of file reached');
