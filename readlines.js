'use strict';

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

    this.options = options;

    this.eofReached = false;
    this.newLineCharacter = options.newLineCharacter;
    this.leftovers = null;

    if (typeof file === 'number') {
        this.fd = file;
    } else {
        this.fd = fs.openSync(file, 'r');
    }
}

LineByLine.prototype = {
    readUntilLine: function() {
        var chunkSize = this.options.readChunk;

        var bufferHistory = [];

        var found = false;
        var newLinePos = 0;

        while (!found) {
            var bufferData = new Buffer(chunkSize);

            var bytesRead = fs.readSync(this.fd, bufferData, 0, chunkSize);

            if (bytesRead < chunkSize) {
                bufferData = bufferData.slice(0, bytesRead);
                bufferHistory.push(bufferData);
                this.eofReached = true;
            } else {
                bufferHistory.push(bufferData);
            }

            for (var bufferPos = 0; bufferPos < bytesRead; bufferPos++) {
                var bufferPosValue = bufferData[bufferPos];

                if (bufferPosValue === this.newLineCharacter) {
                    found = true;
                    break;
                } else {
                    newLinePos++;
                }
            }

            if (this.eofReached) {
                break;
            }
        }

        var total = Buffer.concat(bufferHistory);
        var line = total.slice(0, newLinePos);

        var leftovers = total.slice(newLinePos+1, total.length); // +1 because of the new line

        if (!leftovers.length) {
            leftovers = null;
        }

        return [line, leftovers];
    },
    hasNewLine: function(buffer) {
        var newLinePos = 0;

        for (var bufferPos = 0; bufferPos < buffer.length; bufferPos++) {
            var bufferPosValue = buffer[bufferPos];

            if (bufferPosValue === this.newLineCharacter) {
                break;
            } else {
                newLinePos++;
            }
        }

        if (newLinePos === buffer.length) {
            return false;
        } else {
            return newLinePos;
        }
    },
    next: function() {
        if (this.eofReached && !this.leftovers) {
            if (this.fd) {
                fs.closeSync(this.fd);
                this.fd = null;
            }
            return false;
        }

        var line, read, leftovers;

        if (!this.leftovers) {
            read = this.readUntilLine();
            line = read[0];
            leftovers = read[1];
            this.leftovers = leftovers;
        } else {
            var newLinePos = this.hasNewLine(this.leftovers);

            if (!newLinePos) {
                read = this.readUntilLine();
                line = Buffer.concat([this.leftovers, read[0]]);
                leftovers = read[1];
                this.leftovers = leftovers;
            } else {
                line = this.leftovers.slice(0, newLinePos);
                this.leftovers = this.leftovers.slice(newLinePos+1, this.leftovers.length); //+1 because of the new line
                if (!this.leftovers.length) {
                    this.leftovers = null;
                }
            }
        }

        return line;
    }
};

module.exports = LineByLine;
