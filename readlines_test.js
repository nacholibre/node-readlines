'use strict';

var lineByLine = require('./readlines.js');

var assert = require('assert');

describe('Line by line', function() {
    it('should get all lines', function () {
        var filename = __dirname + '/dummy_files/twoLineFile.txt';

        var liner = new lineByLine(filename);

        assert(liner.next().toString('ascii') === 'hello');
        assert(liner.next().toString('ascii') === 'hello2');
        assert(liner.next() === false);
        assert(liner.next() === false);
        assert(liner.fd === null);
    });

    it('should get all lines even if the file doesnt end with new line', function () {
        var filename = __dirname + '/dummy_files/badEndFile.txt';

        var liner = new lineByLine(filename);

        assert(liner.next().toString('ascii') === 'google.com');
        assert(liner.next().toString('ascii') === 'yahoo.com');
        assert(liner.next() === false);
        assert(liner.fd === null);
    });

    it('should read right between two chunks', function () {
        var filename = __dirname + '/dummy_files/normalFile.txt';
        var liner = new lineByLine(filename, {'readChunk': 16});

        assert(liner.next().toString('ascii') === 'google.com');
        assert(liner.next().toString('ascii') === 'yahoo.com');
        assert(liner.next().toString('ascii') === 'yandex.ru');
        assert(liner.next() === false);
        assert(liner.fd === null);
    });
});
