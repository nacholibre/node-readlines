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

    this.lines = null;

    this.emptyBufferIndexValue = 0x00;
    this.newLineCharacter = 0x0a;

    this.fdPosition = 0;
}

LineByLine.prototype._extractLines = function(buffer) {
    var lines = [];

    var bufferPosition = 0;

    var line = '';

    while (true) {
        var bufferPositionValue = buffer[bufferPosition++];

        if (bufferPositionValue === this.newLineCharacter) {
            lines.push(line + '\n');
            line = '';

            //skip next byte bacause it's \n
            continue;
        } else if (!bufferPositionValue) {
            // end of buffer reached

            if (line !== '') {
                //push if any unfull line is left in the buffer
                lines.push(line);
            }

            break;
        }

        //skip utf stuff
        //http://codepoints.net/U+0002
        //http://codepoints.net/U+0001
        if (bufferPositionValue === 0x02 || bufferPositionValue === 0x01) {
            continue;
        }

        line += String.fromCharCode(bufferPositionValue);
    }

    return lines;
};

LineByLine.prototype.next = function() {
    var line = false;

    if (this.eofReached && this.lines.length === 0) {
        return false;
    }

    var bytesRead;

    if (!this.lines) {
        var bufferData = new Buffer(this.readChunk);

        bytesRead = fs.readSync(this.fd, bufferData, 0, this.readChunk, this.fdPosition);
        this.fdPosition = this.fdPosition + bytesRead;

        if (bytesRead) {
            this.lines = this._extractLines(bufferData);
        }
    }

    if (this.lines.length) {
        line = this.lines.shift();

        var lastLineCharacter = line[line.length-1];

        if (lastLineCharacter !== '\n') {
            var bufferData = new Buffer(this.readChunk);

            bytesRead = fs.readSync(this.fd, bufferData, 0, this.readChunk, this.fdPosition);
            this.fdPosition = this.fdPosition + bytesRead;

            if (bytesRead) {
                var lines = this._extractLines(bufferData);
                line = line + lines.shift();
                this.lines = lines;
            }

        }
    }

    if (bytesRead < this.readChunk) {
        this.eofReached = true;
    }

    if (this.eofReached && this.lines.length === 0) {
        fs.closeSync(this.fd);
        this.fd = null;
    }

    if (line) {
        line = line.replace('\n', '');
    }

    return line;
};

module.exports = LineByLine;
