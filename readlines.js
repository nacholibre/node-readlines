'use strict';

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

        if (typeof options.readSync === 'function') {
   	    this.readSync = options.readSync;
	    this._close = () => null;
	    this.fd = true;
	} else {
            const fs = require('fs');
            if (typeof file !== 'number') {
		this.fd = fs.openSync(file, 'r');
	    } else {
		this.fd = file;
            }
	    this.readSync = (...options) => fs.readSync(this.fd, ...options);
	    this._close = () => fs.closeSync(this.fd);
	}
        this.options = options;

        this.newLineCharacter = options.newLineCharacter;

        this.reset();
    }

    _searchInBuffer(buffer, hexNeedle) {
        let found = -1;

        for (let i = 0; i <= buffer.length; i++) {
            let b_byte = buffer[i];
            if (b_byte === hexNeedle) {
                found = i;
                break;
            }
        }

        return found;
    }

    reset() {
        this.eofReached = false;
        this.linesCache = [];
        this.fdPosition = 0;
    }

    close() {
        this._close();
	this.fd = null;
    }

    _extractLines(buffer) {
        let line;
        const lines = [];
        let bufferPosition = 0;

        let lastNewLineBufferPosition = 0;
        while (true) {
            let bufferPositionValue = buffer[bufferPosition++];

            if (bufferPositionValue === this.newLineCharacter) {
                line = buffer.slice(lastNewLineBufferPosition, bufferPosition);
                lines.push(line);
                lastNewLineBufferPosition = bufferPosition;
            } else if (bufferPositionValue === undefined) {
                break;
            }
        }

        let leftovers = buffer.slice(lastNewLineBufferPosition, bufferPosition);
        if (leftovers.length) {
            lines.push(leftovers);
        }

        return lines;
    };

    _readChunk(lineLeftovers) {
        let totalBytesRead = 0;

        let bytesRead;
        const buffers = [];
        do {
            const readBuffer = new Buffer(this.options.readChunk);

            bytesRead = this.readSync(readBuffer, 0, this.options.readChunk, this.fdPosition);
            totalBytesRead = totalBytesRead + bytesRead;

            this.fdPosition = this.fdPosition + bytesRead;

            buffers.push(readBuffer);
        } while (bytesRead && this._searchInBuffer(buffers[buffers.length-1], this.options.newLineCharacter) === -1);

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
