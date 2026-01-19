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

test('isLast() should return false before reading all lines', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/twoLineFile.txt'));

    assert.strictEqual(liner.isLast(), false, 'isLast should be false before reading');
    
    liner.next(); // Read first line
    assert.strictEqual(liner.isLast(), false, 'isLast should be false after first line');
    
    liner.next(); // Read second line
    assert.strictEqual(liner.isLast(), true, 'isLast should be true after last line');
    
    liner.next(); // Try to read past end
    assert.strictEqual(liner.isLast(), true, 'isLast should still be true');
});

test('isLast() should return true after manual close', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/normalFile.txt'));

    assert.strictEqual(liner.isLast(), false, 'isLast should be false initially');
    
    liner.next(); // Read one line
    liner.close();
    
    assert.strictEqual(liner.isLast(), true, 'isLast should be true after close');
});

test('isLast() should work with empty file', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/emptyFile.txt'));

    assert.strictEqual(liner.isLast(), false, 'isLast should be false before reading');
    
    liner.next(); // Returns null for empty file
    assert.strictEqual(liner.isLast(), true, 'isLast should be true after reading empty file');
});

test('should correctly processes NULL character in lines', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/withNULL.txt'));

    assert.strictEqual(liner.next().toString(), 'line without null', 'line 0: line without null');
    assert.strictEqual(liner.next().toString(), 'line wi'+String.fromCharCode(0)+'th null', 'line 1: line with null');
    assert.strictEqual(liner.next().toString(), 'another line without null', 'line 2: another line without null');

    assert.strictEqual(liner.fd, null, 'fd is null');
});

test('should read 2 lines', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/chunkSize32equalEOL.csv'), { readChunk: 32 });

    assert.strictEqual(liner.next().toString(), '1,user1,#FFFFFF,"message1 mess"', 'line 0: 1,user1,#FFFFFF,"message1 mess"');
    assert.strictEqual(liner.next().toString(), '1,user2,#FFFFFF,"message2"', 'line 1: 1,user2,#FFFFFF,"message2"');
    assert.strictEqual(liner.fd, null, 'fd is null');
});

// ============================================
// LINE ENDING TESTS (LF, CRLF, CR)
// ============================================

test('LF: should read Unix/Linux line endings (\\n)', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/normalFile.txt'));

    assert.strictEqual(liner.next().toString(), 'google.com', 'line 0');
    assert.strictEqual(liner.next().toString(), 'yahoo.com', 'line 1');
    assert.strictEqual(liner.next().toString(), 'yandex.ru', 'line 2');
    assert.strictEqual(liner.next(), null, 'EOF');
});

test('LF: should handle small chunks with Unix line endings', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/normalFile.txt'), {
        readChunk: 5  // Very small chunk to test boundary conditions
    });

    assert.strictEqual(liner.next().toString(), 'google.com', 'line 0');
    assert.strictEqual(liner.next().toString(), 'yahoo.com', 'line 1');
    assert.strictEqual(liner.next().toString(), 'yandex.ru', 'line 2');
    assert.strictEqual(liner.next(), null, 'EOF');
});

test('CRLF: should read Windows line endings (\\r\\n)', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/crlfFile.txt'));

    assert.strictEqual(liner.next().toString(), 'line1', 'line 0');
    assert.strictEqual(liner.next().toString(), 'line2', 'line 1');
    assert.strictEqual(liner.next().toString(), 'line3', 'line 2');
    assert.strictEqual(liner.next(), null, 'EOF');
});

test('CRLF: should handle Windows file without trailing newline', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/crlfNoEndingNewline.txt'));

    assert.strictEqual(liner.next().toString(), 'windows1', 'line 0');
    assert.strictEqual(liner.next().toString(), 'windows2', 'line 1');
    assert.strictEqual(liner.next().toString(), 'windows3', 'line 2');
    assert.strictEqual(liner.next(), null, 'EOF');
});

test('CRLF: should handle small chunks with Windows line endings', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/crlfFile.txt'), {
        readChunk: 5  // Very small chunk to test CRLF boundary conditions
    });

    assert.strictEqual(liner.next().toString(), 'line1', 'line 0');
    assert.strictEqual(liner.next().toString(), 'line2', 'line 1');
    assert.strictEqual(liner.next().toString(), 'line3', 'line 2');
    assert.strictEqual(liner.next(), null, 'EOF');
});

test('CRLF: lines should not contain \\r character', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/crlfFile.txt'));

    let line;
    while (line = liner.next()) {
        const str = line.toString();
        assert.ok(!str.includes('\r'), `Line should not contain \\r: "${str}"`);
        assert.ok(!str.includes('\n'), `Line should not contain \\n: "${str}"`);
    }
});

test('CR: should read classic Mac line endings (\\r only)', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/crOnlyFile.txt'));

    assert.strictEqual(liner.next().toString(), 'cr1', 'line 0');
    assert.strictEqual(liner.next().toString(), 'cr2', 'line 1');
    assert.strictEqual(liner.next().toString(), 'cr3', 'line 2');
    assert.strictEqual(liner.next(), null, 'EOF');
});

test('Mixed: should handle mixed line endings (LF and CRLF)', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/mixedLineEndings.txt'));

    assert.strictEqual(liner.next().toString(), 'mixed1', 'line 0 (LF)');
    assert.strictEqual(liner.next().toString(), 'line2', 'line 1 (CRLF)');
    assert.strictEqual(liner.next().toString(), 'line3', 'line 2 (CRLF)');
    assert.strictEqual(liner.next().toString(), 'line4', 'line 3 (LF)');
    assert.strictEqual(liner.next(), null, 'EOF');
});

test('Mixed: lines should be clean without any line ending characters', () => {
    const liner = new lineByLine(path.resolve(__dirname, 'fixtures/mixedLineEndings.txt'));

    let line;
    while (line = liner.next()) {
        const str = line.toString();
        assert.ok(!str.includes('\r'), `Line should not contain \\r: "${str}"`);
        assert.ok(!str.includes('\n'), `Line should not contain \\n: "${str}"`);
    }
});

// ============================================
// FILE DESCRIPTOR TESTS
// ============================================

const fs = require('fs');

test('should read from file descriptor instead of filename', () => {
    const fd = fs.openSync(path.resolve(__dirname, 'fixtures/normalFile.txt'), 'r');
    const liner = new lineByLine(fd);

    assert.strictEqual(liner.next().toString(), 'google.com', 'line 0');
    assert.strictEqual(liner.next().toString(), 'yahoo.com', 'line 1');
    assert.strictEqual(liner.next().toString(), 'yandex.ru', 'line 2');
    assert.strictEqual(liner.next(), null, 'EOF');
    // Note: liner.close() was called internally, fd is now closed
});

test('should read CRLF file from file descriptor', () => {
    const fd = fs.openSync(path.resolve(__dirname, 'fixtures/crlfFile.txt'), 'r');
    const liner = new lineByLine(fd);

    assert.strictEqual(liner.next().toString(), 'line1', 'line 0');
    assert.strictEqual(liner.next().toString(), 'line2', 'line 1');
    assert.strictEqual(liner.next().toString(), 'line3', 'line 2');
    assert.strictEqual(liner.next(), null, 'EOF');
});

// ============================================
// STDIN TESTS
// ============================================

test('stdin (fd 0) should be supported', () => {
    const { spawnSync } = require('child_process');
    
    const result = spawnSync('node', ['-e', `
        const LineByLine = require('./readlines.js');
        const liner = new LineByLine(0); // fd 0 = stdin
        const lines = [];
        let line;
        while (line = liner.next()) {
            lines.push(line.toString());
        }
        console.log(JSON.stringify(lines));
    `], {
        cwd: path.resolve(__dirname, '..'),
        input: 'line1\nline2\nline3\n',
        encoding: 'utf8'
    });
    
    assert.strictEqual(result.status, 0, 'Process should exit successfully');
    const lines = JSON.parse(result.stdout.trim());
    assert.deepStrictEqual(lines, ['line1', 'line2', 'line3'], 'Should read all 3 lines from stdin');
});

test('stdin with CRLF line endings should work', () => {
    const { spawnSync } = require('child_process');
    
    const result = spawnSync('node', ['-e', `
        const LineByLine = require('./readlines.js');
        const liner = new LineByLine(0);
        const lines = [];
        let line;
        while (line = liner.next()) {
            lines.push(line.toString());
        }
        console.log(JSON.stringify(lines));
    `], {
        cwd: path.resolve(__dirname, '..'),
        input: 'win1\r\nwin2\r\nwin3\r\n',
        encoding: 'utf8'
    });
    
    assert.strictEqual(result.status, 0, 'Process should exit successfully');
    const lines = JSON.parse(result.stdout.trim());
    assert.deepStrictEqual(lines, ['win1', 'win2', 'win3'], 'Should read CRLF lines from stdin');
});

test('stdin without trailing newline should work', () => {
    const { spawnSync } = require('child_process');
    
    const result = spawnSync('node', ['-e', `
        const LineByLine = require('./readlines.js');
        const liner = new LineByLine(0);
        const lines = [];
        let line;
        while (line = liner.next()) {
            lines.push(line.toString());
        }
        console.log(JSON.stringify(lines));
    `], {
        cwd: path.resolve(__dirname, '..'),
        input: 'first\nsecond\nthird',  // No trailing newline
        encoding: 'utf8'
    });
    
    assert.strictEqual(result.status, 0, 'Process should exit successfully');
    const lines = JSON.parse(result.stdout.trim());
    assert.deepStrictEqual(lines, ['first', 'second', 'third'], 'Should read all lines even without trailing newline');
});
