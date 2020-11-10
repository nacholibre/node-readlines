'use strict';

const fs = require('fs');
const os = require('os');

function calcTime(file, lineVersion) {
    var startTime = Date.now();

    var liner = new lineVersion(file);

    var line;
    var lineNumber = 0;
    while (line = liner.next()) {
      lineNumber++;
    }
    return (Date.now() - startTime);
}

function average(arr) {
    var sum = arr.reduce(function(acc, cur) {
      acc += cur;
      return acc;
    }, 0);
    // want in seconds
    return ((sum / arr.length) / 1000);
}

function speedTest(file, lineVersion, trials) {
    var times = [];
    for (var i = 0; i < trials; i++) {
      var time = calcTime(file, lineVersion);
      times.push(time);
    }
    return average(times);
}

function createDummyFileSync (lines) {
    const fileLocation = os.tmpdir() + '/testfile.txt';
    const fd = fs.openSync(fileLocation, 'w');
    for (let i = 0; i<=lines; i++) {
        let line = 'hello world';
        if (i % 5 === 0) {
            line = 'hello world bigger line here this is the bigger line here here here yes here';
        } else if (i % 9 === 0) {
            line = 'hello world medium length line is here';
        } else if (i % 16 === 0) {
            line = 'this is the super long lineeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        }
        fs.writeSync(fd, line + "\n");
    }
    fs.closeSync(fd);
    return fileLocation;
}

module.exports = {
    speedTest: speedTest,
    createDummyFileSync: createDummyFileSync
};
