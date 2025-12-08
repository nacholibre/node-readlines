'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const lineByLine = require('../readlines.js');
const path = require('path');

test('should get all lines', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/twoLineFile.txt'));

    assert.strictEqual(liner.next().toString('ascii'), 'hello', 'line 0: hello');
    assert.strictEqual(liner.next().toString('ascii'), 'hello2', 'line 1: hello2');
    assert.strictEqual(liner.next(), null, 'line 3: false');
    assert.strictEqual(liner.next(), null, 'line 4: false');
    assert.strictEqual(liner.fd, null, 'fd null');
});

test('should get all lines even if the file doesnt end with new line', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/badEndFile.txt'));

    assert.strictEqual(liner.next().toString('ascii'), 'google.com', 'line 0: google.com');
    assert.strictEqual(liner.next().toString('ascii'), 'yahoo.com', 'line 1: yahoo.com');
    assert.strictEqual(liner.next(), null, 'line 3: false');
    assert.strictEqual(liner.fd, null, 'fd is null');
});

test('should get all lines if there is no new lines', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/noNewLinesFile.txt'));

    assert.strictEqual(liner.next().toString('ascii'), 'no new line', 'line 0: no new line');
    assert.strictEqual(liner.next(), null, 'line 1: false');
    assert.strictEqual(liner.fd, null, 'fd is null');
});

test('should handle empty files', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/emptyFile.txt'));

    assert.strictEqual(liner.next(), null, 'line 0: false');
    assert.strictEqual(liner.fd, null, 'line 0: false');
});

test('should read right between two chunks', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/normalFile.txt'), {
        readChunk: 16
    });

    assert.strictEqual(liner.next().toString('ascii'), 'google.com', 'line 0: google.com');
    assert.strictEqual(liner.next().toString('ascii'), 'yahoo.com', 'line 1: yahoo.com');
    assert.strictEqual(liner.next().toString('ascii'), 'yandex.ru', 'line 2: yandex.ru');
    assert.strictEqual(liner.next(), null, 'line 3: false');
    assert.strictEqual(liner.fd, null, 'fs is null');
});

test('should read empty lines', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/withEmptyLines.txt'));

    assert.strictEqual(liner.next().toString('ascii'), 'hello', 'line 0: hello');
    assert.strictEqual(liner.next().toString('ascii'), 'hello4', 'line 1: hello4');
    assert.strictEqual(liner.next().toString('ascii'), '', 'line 2: ');
    assert.strictEqual(liner.next().toString('ascii'), 'hello2', 'line 3: hello2');
    assert.strictEqual(liner.next().toString('ascii'), 'hello3', 'line 4: hello3');
    assert.strictEqual(liner.next(), null, 'line 5: false');
    assert.strictEqual(liner.fd, null, 'fs is null');
});

test('should reset and start from the beggining', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/normalFile.txt'), {
        readChunk: 16
    });

    assert.strictEqual(liner.next().toString('ascii'), 'google.com', 'line 0: google.com');
    assert.strictEqual(liner.next().toString('ascii'), 'yahoo.com', 'line 1: yahoo.com');

    liner.reset()

    assert.strictEqual(liner.next().toString('ascii'), 'google.com', 'line 0: google.com');
    assert.strictEqual(liner.next().toString('ascii'), 'yahoo.com', 'line 1: yahoo.com');
    assert.strictEqual(liner.next().toString('ascii'), 'yandex.ru', 'line 2: yandex.ru');
    assert.strictEqual(liner.next(), null, 'line 3: false');
    assert.strictEqual(liner.fd, null, 'fd is null');
});

test('should read big lines', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/bigLines.json'));

    assert.ok(JSON.parse(liner.next()), 'line 0: valid JSON');
    assert.ok(JSON.parse(liner.next()), 'line 1: valid JSON');
    assert.ok(JSON.parse(liner.next()), 'line 2: valid JSON');

    assert.strictEqual(liner.next(), null, 'line 3: false');
    assert.strictEqual(liner.fd, null, 'fd is null');
});

test('Non-Latin Char JSON', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/eiffel.geojson'));

    assert.ok(JSON.parse(liner.next().toString()), 'line 0: valid JSON');

    assert.strictEqual(liner.fd, null, 'fd is null');
});

test('Manually Close', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/normalFile.txt'));

    assert.strictEqual(liner.next().toString(), 'google.com', 'line 0: google.com');

    liner.close();
    assert.strictEqual(liner.fd, null, 'fd is null');

    assert.strictEqual(liner.next(), null, 'line after close: false');
});

test('should correctly processes NULL character in lines', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/withNULL.txt'));

    assert.strictEqual(liner.next().toString(), 'line without null', 'line 0: line without null');
    assert.strictEqual(liner.next().toString(), 'line wi'+String.fromCharCode(0)+'th null', 'line 1: line with null');
    assert.strictEqual(liner.next().toString(), 'another line without null', 'line 2: another line without null');

    assert.strictEqual(liner.fd, null, 'fd is null');
});
