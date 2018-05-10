'use strict';

const lineByLine = require('../readlines.js');
const path = require('path');
const test = require('tape');

test('should get all lines', (t) => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/twoLineFile.txt'));

    t.equals(liner.next().toString('ascii'), 'hello', 'line 0: hello');
    t.equals(liner.next().toString('ascii'), 'hello2', 'line 1: hello2');
    t.equals(liner.next(), false, 'line 3: false');
    t.equals(liner.next(), false, 'line 4: false');
    t.equals(liner.fd, null, 'fd null');
    t.end();
});

test('should get all lines even if the file doesnt end with new line', (t) => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/badEndFile.txt'));

    t.equals(liner.next().toString('ascii'), 'google.com', 'line 0: google.com');
    t.equals(liner.next().toString('ascii'), 'yahoo.com', 'line 1: yahoo.com');
    t.equals(liner.next(), false, 'line 3: false');
    t.equals(liner.fd, null, 'fd is null');
    t.end();
});

test('should get all lines if there is no new lines', (t) => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/noNewLinesFile.txt'));

    t.equals(liner.next().toString('ascii'), 'no new line', 'line 0: no new line');
    t.equals(liner.next(), false, 'line 1: false');
    t.equals(liner.fd, null, 'fd is null');
    t.end();
});

test('should handle empty files', (t) => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/emptyFile.txt'));

    t.equals(liner.next(), false, 'line 0: false');
    t.equals(liner.fd, null, 'line 0: false');
    t.end();
});

test('should read right between two chunks', (t) => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/normalFile.txt'), {
        readChunk: 16
    });

    t.equals(liner.next().toString('ascii'), 'google.com', 'line 0: google.com');
    t.equals(liner.next().toString('ascii'), 'yahoo.com', 'line 1: yahoo.com');
    t.equals(liner.next().toString('ascii'), 'yandex.ru', 'line 2: yandex.ru');
    t.equals(liner.next(), false, 'line 3: false');
    t.equals(liner.fd, null, 'fs is null');
    t.end();
});

test('should read empty lines', (t) => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/withEmptyLines.txt'));

    t.equals(liner.next().toString('ascii'), 'hello', 'line 0: hello');
    t.equals(liner.next().toString('ascii'), 'hello4', 'line 1: hello4');
    t.equals(liner.next().toString('ascii'), '', 'line 2: ');
    t.equals(liner.next().toString('ascii'), 'hello2', 'line 3: hello2');
    t.equals(liner.next().toString('ascii'), 'hello3', 'line 4: hello3');
    t.equals(liner.next(), false, 'line 5: false');
    t.equals(liner.fd, null, 'fs is null');
    t.end();
});

test('should reset and start from the beggining', (t) => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/normalFile.txt'), {
        readChunk: 16
    });

    t.equals(liner.next().toString('ascii'), 'google.com', 'line 0: google.com');
    t.equals(liner.next().toString('ascii'), 'yahoo.com', 'line 1: yahoo.com');

    liner.reset()

    t.equals(liner.next().toString('ascii'), 'google.com', 'line 0: google.com');
    t.equals(liner.next().toString('ascii'), 'yahoo.com', 'line 1: yahoo.com');
    t.equals(liner.next().toString('ascii'), 'yandex.ru', 'line 2: yandex.ru');
    t.equals(liner.next(), false, 'line 3: false');
    t.equals(liner.fd, null, 'fd is null');
    t.end();
});

test('should read big lines', (t) => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/bigLines.json'));
    

    t.ok(JSON.parse(liner.next()), 'line 0: valid JSON');
    t.ok(JSON.parse(liner.next()), 'line 1: valid JSON');
    t.ok(JSON.parse(liner.next()), 'line 2: valid JSON');

    t.equals(liner.next(), false, 'line 3: false');
    t.equals(liner.fd, null, 'fd is null');
    t.end();
});

test('Non-Latin Char JSON', (t) => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/eiffel.geojson'));

    t.ok(JSON.parse(liner.next().toString()), 'line 0: valid JSON');

    t.equals(liner.fd, null, 'fd is null');
    t.end();
});

test('Manually Close', (t) => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/normalFile.txt'));

    t.equals(liner.next().toString(), 'google.com', 'line 0: google.com');

    liner.close();
    t.equals(liner.fd, null, 'fd is null');

    t.equals(liner.next(), false, 'line after close: false');
    t.end();
});
