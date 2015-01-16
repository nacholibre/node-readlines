'use strict';

var fs = require('fs');

function LineByLine(file, chunk) {
    this.readChunk = chunk || 1024;

    this.bufferData = null;
    this.bytesRead = 0;

    this.bufferPosition = 0;
    this.eofReached = false;

    this.fd = fs.openSync(file, 'r');

    this.line = '';

    this.linesCache = [];

    this.emptyBufferIndexValue = 0x00;
    this.newLineCharacter = 0x0a;

    this.lastBytePosition = null;

    this.fdPosition = 0;
}

LineByLine.prototype._extractLines = function(buffer) {
    var line;
    var lines = [];
    var bufferPosition = 0;


    var lastNewLineBufferPosition = 0;
    while (true) {
        var bufferPositionValue = buffer[bufferPosition++];

        if (bufferPositionValue === this.newLineCharacter) {
            line = buffer.slice(lastNewLineBufferPosition, bufferPosition);
            lines.push(line);
            lastNewLineBufferPosition = bufferPosition;
        } else if (!bufferPositionValue) {
            break;
        }
    }

    var leftovers = buffer.slice(lastNewLineBufferPosition, bufferPosition);
    if (leftovers.length) {
        lines.push(leftovers);
    }

    return lines;
};

LineByLine.prototype._readChunk = function(lineLeftovers) {
    var bufferData = new Buffer(this.readChunk);

    var bytesRead = fs.readSync(this.fd, bufferData, 0, this.readChunk, this.fdPosition);
    this.fdPosition = this.fdPosition + bytesRead;

    if (bytesRead < this.readChunk) {
        this.eofReached = true;
        bufferData = bufferData.slice(0, bytesRead);
    }

    if (bytesRead) {
        this.linesCache = this._extractLines(bufferData);

        if (lineLeftovers) {
            this.linesCache[0] = Buffer.concat([lineLeftovers, this.linesCache[0]]);
        }
    }

    return bytesRead;
};

LineByLine.prototype.next = function() {
    var line = false;

    if (this.eofReached && this.linesCache.length === 0) {
        return line;
    }

    var bytesRead;

    if (!this.linesCache.length) {
        bytesRead = this._readChunk();
    }

    if (this.linesCache.length) {
        line = this.linesCache.shift();

        var lastLineCharacter = line[line.length-1];

        if (lastLineCharacter !== 0x0a) {
            bytesRead = this._readChunk(line);

            if (bytesRead) {
                line = this.linesCache.shift();
            }
        }
    }

    if (this.eofReached && this.linesCache.length === 0) {
        fs.closeSync(this.fd);
        this.fd = null;
    }

    if (line && line[line.length-1] === this.newLineCharacter) {
        line = line.slice(0, line.length-1);
    }

    return line;
};

module.exports = LineByLine;
