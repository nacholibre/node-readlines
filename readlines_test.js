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

    it('should get all lines if there is no new lines', function () {
        var filename = __dirname + '/dummy_files/noNewLinesFile.txt';

        var liner = new lineByLine(filename);

        assert(liner.next().toString('ascii') === 'no new line');
        assert(liner.next() === false);
        assert(liner.fd === null);
    });

    it('should handle empty files', function () {
        var filename = __dirname + '/dummy_files/emptyFile.txt';

        var liner = new lineByLine(filename);

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

    it('should read empty lines', function () {
        var filename = __dirname + '/dummy_files/withEmptyLines.txt';
        var liner = new lineByLine(filename);

        assert(liner.next().toString('ascii') === 'hello');
        assert(liner.next().toString('ascii') === 'hello4');
        assert(liner.next().toString('ascii') === '');
        assert(liner.next().toString('ascii') === 'hello2');
        assert(liner.next().toString('ascii') === 'hello3');
        assert(liner.next() === false);
        assert(liner.fd === null);
    });

    it('should reset and start from the beggining', function() {
        var filename = __dirname + '/dummy_files/normalFile.txt';
        var liner = new lineByLine(filename, {'readChunk': 16});

        assert(liner.next().toString('ascii') === 'google.com');
        assert(liner.next().toString('ascii') === 'yahoo.com');

        liner.reset()

        assert(liner.next().toString('ascii') === 'google.com');
        assert(liner.next().toString('ascii') === 'yahoo.com');
        assert(liner.next().toString('ascii') === 'yandex.ru');
        assert(liner.next() === false);
        assert(liner.fd === null);
    });

    it('should read big lines', function() {
        var filename = __dirname + '/dummy_files/bigLines.json';
        var liner = new lineByLine(filename);

        var parsedLine = JSON.parse(liner.next().toString('ascii'));
        assert(parsedLine);

        var parsedLine = JSON.parse(liner.next().toString('ascii'));
        assert(parsedLine);

        var parsedLine = JSON.parse(liner.next().toString('ascii'));
        assert(parsedLine);

        assert(liner.next() === false);
        assert(liner.fd === null);
    });
});
