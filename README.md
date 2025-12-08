# n-readlines

[![Tests](https://github.com/nacholibre/node-readlines/actions/workflows/test.yml/badge.svg)](https://github.com/nacholibre/node-readlines/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/n-readlines.svg)](https://www.npmjs.com/package/n-readlines)
[![npm downloads](https://img.shields.io/npm/dm/n-readlines.svg)](https://www.npmjs.com/package/n-readlines)
[![license](https://img.shields.io/npm/l/n-readlines.svg)](https://github.com/nacholibre/node-readlines/blob/master/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue.svg)](https://www.typescriptlang.org/)

> 📖 Read files line-by-line, synchronously. Zero dependencies.

Reading a file line by line may seem trivial, but in Node.js there's no straightforward way to do it. Many libraries use Transform Streams which feels like overkill for such a simple task. This library uses only Node's built-in `fs` module to provide a clean, synchronous API.

## ✨ Features

- 🚀 **Simple API** — just `next()` to get the next line
- 📦 **Zero dependencies** — only uses Node.js built-ins
- 🔄 **Synchronous** — no callbacks or promises to manage
- 💾 **Memory efficient** — reads in chunks, doesn't load entire file
- 🔧 **Configurable** — custom chunk sizes
- 📘 **TypeScript support** — includes type definitions
- 🪟 **Cross-platform** — handles LF, CRLF, and CR line endings automatically
- 📥 **Stdin support** — read from stdin by passing fd 0

## 📦 Installation

```bash
npm install n-readlines
```

**Requirements:** Node.js >= 18.x

## 🚀 Quick Start

```javascript
const LineByLine = require('n-readlines');
const liner = new LineByLine('./textfile.txt');

let line;
while (line = liner.next()) {
    console.log(line.toString());
}
```

### TypeScript

```typescript
import LineByLine = require('n-readlines');
const liner = new LineByLine('./textfile.txt');

let line: Buffer | null;
while (line = liner.next()) {
    console.log(line.toString());
}
```

## 📖 API Reference

### Constructor

```javascript
new LineByLine(filename, [options])
new LineByLine(fd, [options])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `filename` | `string` | Path to the file to read |
| `fd` | `number` | File descriptor (0 for stdin, or from `fs.openSync`) |
| `options.readChunk` | `number` | Bytes to read at once. Default: `1024` |

### Methods

#### `.next()` → `Buffer | null`

Returns the next line as a `Buffer` (without the newline character), or `null` when end of file is reached.

```javascript
const line = liner.next();
if (line !== null) {
    console.log(line.toString()); // Convert Buffer to string
}
```

#### `.reset()`

Resets the reader to the beginning of the file.

```javascript
liner.next(); // Read first line
liner.next(); // Read second line
liner.reset(); // Go back to start
liner.next(); // First line again
```

> **Note:** `reset()` does not work with stdin.

#### `.close()`

Manually closes the file. Subsequent `next()` calls will return `null`.

```javascript
liner.next();
liner.close(); // Done reading early
liner.next(); // Returns null
```

> **Note:** When reading from stdin, `close()` does not close the stdin stream.

## 📚 Examples

### Basic line reading

```javascript
const LineByLine = require('n-readlines');
const liner = new LineByLine('./data.txt');

let line;
let lineNumber = 1;

while (line = liner.next()) {
    console.log(`Line ${lineNumber}: ${line.toString('utf8')}`);
    lineNumber++;
}

console.log('Finished reading file');
```

### Reading from stdin

```javascript
const LineByLine = require('n-readlines');
const liner = new LineByLine(0); // fd 0 = stdin

let line;
while (line = liner.next()) {
    console.log(line.toString());
}
```

Usage:
```bash
echo -e "line1\nline2\nline3" | node script.js
cat file.txt | node script.js
```

### Reading with custom chunk size

```javascript
const liner = new LineByLine('./large-file.txt', {
    readChunk: 4096 // Read 4KB at a time
});
```

### Processing JSON lines (JSONL/NDJSON)

```javascript
const LineByLine = require('n-readlines');
const liner = new LineByLine('./data.jsonl');

let line;
while (line = liner.next()) {
    const record = JSON.parse(line.toString());
    console.log(record);
}
```

### Early termination

```javascript
const liner = new LineByLine('./log.txt');

let line;
while (line = liner.next()) {
    const text = line.toString();
    
    if (text.includes('ERROR')) {
        console.log('Found error:', text);
        liner.close(); // Stop reading
        break;
    }
}
```

## 📝 Notes

- Lines are returned as `Buffer` objects — call `.toString()` to convert to string
- The newline character is **not** included in the returned line
- Files without a trailing newline are handled correctly
- Empty lines are preserved and returned as empty buffers
- Returns `null` (not `false`) when end of file is reached

### Line Ending Support

The library automatically handles all common line ending formats:

| Format | Characters | Platform |
|--------|------------|----------|
| **LF** | `\n` | Unix, Linux, macOS |
| **CRLF** | `\r\n` | Windows |
| **CR** | `\r` | Classic Mac OS |

Files with mixed line endings are also supported — each line is detected individually.

## 📄 License

MIT © [Yoan Arnaudov](https://github.com/nacholibre)
