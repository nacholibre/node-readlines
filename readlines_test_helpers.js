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

function runThrough(file, lineVersion, trials) {
    var times = [];
    for (var i = 0; i < trials; i++) {
      var time = calcTime(file, lineVersion);
      times.push(time);
    }
    return average(times);
}

module.exports = {
    runThrough: runThrough
};