'use strict';

const fs = require('fs');

const LF = 0x0a;  // \n - Unix/Linux/macOS
const CR = 0x0d;  // \r - Classic Mac OS / part of Windows CRLF
const STDIN_FD = 0;

/**
 * @class
 */
class LineByLine {
    constructor(file, options) {
        options = options || {};

        if (!options.readChunk) options.readChunk = 1024;

        if (typeof file === 'number') {
            this.fd = file;
        } else {
            this.fd = fs.openSync(file, 'r');
        }

        this.options = options;
        this.isStdin = this.fd === STDIN_FD;

        this.reset();
    }

    _searchInBuffer(buffer) {
        for (let i = 0; i < buffer.length; i++) {
            const byte = buffer[i];
            if (byte === LF || byte === CR) {
                return i;
            }
        }
        return -1;
    }

    reset() {
        this.eofReached = false;
        this.linesCache = [];
        this.fdPosition = 0;
        this.lastChunkEndedWithCR = false;
    }

    close() {
        // Don't close stdin
        if (!this.isStdin) {
            fs.closeSync(this.fd);
        }
        this.fd = null;
    }

    _extractLines(buffer, isEof) {
        const lines = [];
        let lineStart = 0;

        // If last chunk ended with CR and this one starts with LF, skip the LF
        if (this.lastChunkEndedWithCR && buffer.length > 0 && buffer[0] === LF) {
            lineStart = 1;
        }
        this.lastChunkEndedWithCR = false;

        for (let i = lineStart; i < buffer.length; i++) {
            const byte = buffer[i];

            if (byte === LF) {
                // LF found - extract line (without the LF)
                lines.push(buffer.slice(lineStart, i));
                lineStart = i + 1;
            } else if (byte === CR) {
                const lineEnd = i;
                
                // Check if this is the last byte in the buffer
                if (i + 1 >= buffer.length) {
                    // CR at end of buffer - might be start of CRLF
                    if (!isEof) {
                        // Not at EOF, mark that we ended with CR
                        this.lastChunkEndedWithCR = true;
                    }
                    // Extract line without the CR
                    lines.push(buffer.slice(lineStart, lineEnd));
                    lineStart = i + 1;
                } else if (buffer[i + 1] === LF) {
                    // CRLF - skip both characters
                    lines.push(buffer.slice(lineStart, lineEnd));
                    i++;  // Skip the LF
                    lineStart = i + 1;
                } else {
                    // Standalone CR (classic Mac)
                    lines.push(buffer.slice(lineStart, lineEnd));
                    lineStart = i + 1;
                }
            }
        }

        // Add any remaining content (incomplete line without newline)
        if (lineStart < buffer.length) {
            lines.push(buffer.slice(lineStart));
        }

        return lines;
    }

    _readChunk(lineLeftovers) {
        let totalBytesRead = 0;

        let bytesRead;
        const buffers = [];
        do {
            const readBuffer = Buffer.alloc(this.options.readChunk);

            // For stdin (non-seekable), pass null for position to read from current position
            const position = this.isStdin ? null : this.fdPosition;
            bytesRead = fs.readSync(this.fd, readBuffer, 0, this.options.readChunk, position);
            totalBytesRead = totalBytesRead + bytesRead;

            this.fdPosition = this.fdPosition + bytesRead;

            buffers.push(readBuffer);
        } while (bytesRead && this._searchInBuffer(buffers[buffers.length-1]) === -1);

        let bufferData = Buffer.concat(buffers);

        if (bytesRead < this.options.readChunk) {
            this.eofReached = true;
            bufferData = bufferData.slice(0, totalBytesRead);
        }

        if (totalBytesRead) {
            this.linesCache = this._extractLines(bufferData, this.eofReached);

            if (lineLeftovers) {
                if (this.linesCache.length > 0) {
                    this.linesCache[0] = Buffer.concat([lineLeftovers, this.linesCache[0]]);
                } else {
                    this.linesCache.push(lineLeftovers);
                }
            }
        }

        return totalBytesRead;
    }

    next() {
        // Check for null specifically, not falsy (fd 0 is stdin and is valid)
        if (this.fd === null) return null;

        let line = null;

        if (this.eofReached && this.linesCache.length === 0) {
            return line;
        }

        let bytesRead;

        if (!this.linesCache.length) {
            bytesRead = this._readChunk();
        }

        if (this.linesCache.length) {
            line = this.linesCache.shift();

            // Check if this might be an incomplete line (no newline found yet)
            // This happens when we read a chunk that doesn't contain a newline
            if (!this.eofReached && this.linesCache.length === 0) {
                bytesRead = this._readChunk(line);

                if (bytesRead && this.linesCache.length) {
                    line = this.linesCache.shift();
                }
            }
        }

        if (this.eofReached && this.linesCache.length === 0) {
            this.close();
        }

        return line;
    }
}

module.exports = LineByLine;
