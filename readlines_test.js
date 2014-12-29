'use strict';

var lineByLine = require('./readlines.js');
var fs = require('fs');

var assert = require('assert');

describe('Line by line', function() {
    it('should get all lines', function () {
        var filename = __dirname + 'twoLineFile.txt';
        fs.writeFileSync(filename, 'hello\nhello2\n');

        var liner = new lineByLine(filename);

        assert(liner.next() === 'hello');
        assert(liner.next() === 'hello2');
        assert(liner.next() === false);
        assert(liner.next() === false);
        assert(liner.fd === null);

        fs.unlink(filename);
    });

    it('should get all lines even if the file doesnt end with new line', function () {
        var filename = __dirname + 'badEndFile.txt';
        fs.writeFileSync(filename, 'google.com\nyahoo.com');
        var liner = new lineByLine(filename);

        assert(liner.next() === 'google.com');
        assert(liner.next() === 'yahoo.com');
        assert(liner.next() === false);
        assert(liner.fd === null);

        fs.unlink(filename);
    });

    it('should read right between two chunks', function () {
        var filename = __dirname + 'normalFile.txt';
        fs.writeFileSync(filename, 'google.com\nyahoo.com\nyandex.ru\n');
        var liner = new lineByLine(filename, 16);

        assert(liner.next() === 'google.com');
        assert(liner.next() === 'yahoo.com');
        assert(liner.next() === 'yandex.ru');
        assert(liner.next() === false);
        assert(liner.fd === null);

        fs.unlink(filename);
    });
});
