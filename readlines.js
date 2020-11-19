'use strict';

const fs = require('fs');

/**
 * @class
 */
class LineByLine {
    constructor(file, options) {
        options = options || {};

        if (!options.readChunk) options.readChunk = 1024;

        if (!options.newLineCharacter) {
            options.newLineCharacter = 0x0a; //linux line ending
        } else {
            options.newLineCharacter = options.newLineCharacter.charCodeAt(0);
        }

        if (typeof file === 'number') {
            this.fd = file;
        } else {
            this.fd = fs.openSync(file, 'r');
        }

        this.options = options;

        this.newLineCharacter = options.newLineCharacter;

        this.reset();
    }

    reset() {
        this.eofReached = false;
        this.linesCache = [];
        this.fdPosition = 0;
    }

    close() {
        fs.closeSync(this.fd);
        this.fd = null;
    }

    _extractLines(buffer) {
        const lines = [];
        let startFrom = 0;

        while (true) {
            let newLineIndex = buffer.indexOf(this.newLineCharacter, startFrom);

            // There is no new line found.
            if (newLineIndex === -1) {
                // Get the last slice of the bufer and push it.
                lines.push(buffer.slice(startFrom));
                break;
            }

            lines.push(buffer.slice(startFrom, newLineIndex+1));
            startFrom += (newLineIndex-startFrom)+1;

            // End is already reached, there is no more from this buffer to
            // read, return the lines.
            if (startFrom >= buffer.length) {
                return lines;
            }
        }

        return lines;
    };

    _readChunk(lineLeftovers) {
        let totalBytesRead = 0;

        let bytesRead;
        const buffers = [];
        do {
            const readBuffer = Buffer.alloc(this.options.readChunk);

            bytesRead = fs.readSync(this.fd, readBuffer, 0, this.options.readChunk, this.fdPosition);
            totalBytesRead = totalBytesRead + bytesRead;

            this.fdPosition = this.fdPosition + bytesRead;

            buffers.push(readBuffer);
        } while (bytesRead && buffers[buffers.length-1].indexOf(this.options.newLineCharacter) === -1);

        let bufferData = Buffer.concat(buffers);

        if (bytesRead < this.options.readChunk) {
            this.eofReached = true;
            bufferData = bufferData.slice(0, totalBytesRead);
        }

        if (totalBytesRead) {
            this.linesCache = this._extractLines(bufferData);

            if (lineLeftovers) {
                this.linesCache[0] = Buffer.concat([lineLeftovers, this.linesCache[0]]);
            }
        }

        return totalBytesRead;
    }

    next() {
        if (!this.fd) return false;

        let line = false;

        if (this.eofReached && this.linesCache.length === 0) {
            return line;
        }

        let bytesRead;

        if (!this.linesCache.length) {
            bytesRead = this._readChunk();
        }

        if (this.linesCache.length) {
            line = this.linesCache.shift();

            const lastLineCharacter = line[line.length-1];

            if (lastLineCharacter !== this.newLineCharacter) {
                bytesRead = this._readChunk(line);

                if (bytesRead) {
                    line = this.linesCache.shift();
                }
            }
        }

        if (this.eofReached && this.linesCache.length === 0) {
            this.close();
        }

        if (line && line[line.length-1] === this.newLineCharacter) {
            line = line.slice(0, line.length-1);
        }

        return line;
    }
}

module.exports = LineByLine;
