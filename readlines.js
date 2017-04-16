'use strict';

var os = require('os');
var fs = require('fs');

function LineByLine(file, options) {
    options = options || {};

    if (!options.readChunk) {
        options.readChunk = 1024;
    }

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

LineByLine.prototype._searchInBuffer = function(buffer, hexNeedle) {
    var found = -1;

    for (var i = 0; i <= buffer.length; i++) {
        var b_byte = buffer[i];
        if (b_byte === hexNeedle) {
            found = i;
            break;
        }
    }

    return found;
};

LineByLine.prototype.reset = function() {
    this.bufferData = null;
    this.bytesRead = 0;

    this.bufferPosition = 0;
    this.eofReached = false;

    this.line = '';

    this.linesCache = [];

    this.lastBytePosition = null;

    this.fdPosition = 0;
};

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
    var bufferData = new Buffer(this.options.readChunk);

    var totalBytesRead = 0;

    var bytesRead = fs.readSync(this.fd, bufferData, 0, this.options.readChunk, this.fdPosition);

    totalBytesRead = totalBytesRead + bytesRead;

    this.fdPosition = this.fdPosition + bytesRead;

    var buffers = [];
    buffers.push(bufferData);

    var lastBuffer = buffers[buffers.length-1];

    while(this._searchInBuffer(buffers[buffers.length-1], this.options.newLineCharacter) === -1) {
        //new line character doesn't exist in the readed data, so we must read
        //again
        var newBuffer = new Buffer(this.options.readChunk);

        var bytesRead = fs.readSync(this.fd, newBuffer, 0, this.options.readChunk, this.fdPosition);
        totalBytesRead = totalBytesRead + bytesRead;

        this.fdPosition = this.fdPosition + bytesRead;

        buffers.push(newBuffer);
    }

    bufferData = Buffer.concat(buffers);

    if (bytesRead < this.options.readChunk) {
        this.eofReached = true;
        bufferData = bufferData.slice(0, totalBytesRead);
    }

    if (bytesRead) {
        this.linesCache = this._extractLines(bufferData);

        if (lineLeftovers) {
            this.linesCache[0] = Buffer.concat([lineLeftovers, this.linesCache[0]]);
        }
    }

    return totalBytesRead;
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

        while(line.toString().indexOf(os.EOL))
        {
          if (lastLineCharacter !== 0x0a && !this.eofReached) {
              bytesRead = this._readChunk(line);

              if (bytesRead) {
                  line = this.linesCache.shift();
              }
          }
          if(line.toString().indexOf(os.EOL) > 0)
          {
            var enterPos = line.toString().indexOf(os.EOL);
            line = line.slice(0, line.toString().indexOf(os.EOL));
            this.fdPosition = this.fdPosition - (enterPos - line.length);
            break;
          }
          if(this.eofReached) {
            break;
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
