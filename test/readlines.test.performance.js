'use strict';

const lineByLine = require('../readlines.js');
const speedTest = require('./readlines.test.helpers.js').speedTest;
const createDummyFileSync = require('./readlines.test.helpers.js').createDummyFileSync;

const linesCount = 500000;
const dummyFileLocation = createDummyFileSync(linesCount);
const tries = 5;
const avg = speedTest(dummyFileLocation, lineByLine, tries);
console.log('Average time in seconds to parse ' + linesCount + ' lines: ' + avg.toFixed(5));
