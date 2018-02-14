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

  if (typeof file === 'number') {
      this.fd = file;
  } else {
      this.fd = fs.openSync(file, 'r');
  }

  this.options = options;

  this.newLineCharacter = options.newLineCharacter;

  this.reset();
}

LineByLine.prototype._reachedEndOfAtLeastOneLine = function(buffer, hexNeedle) {
  for (var i = 0; i < buffer.length; i++) {
      var b_byte = buffer[i];
      if (b_byte === hexNeedle) {
          return true;
      }
  }

  return false;
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

LineByLine.prototype._readChunk = function() {
  var totalBytesRead = 0;

  var bytesRead;
  var buffers = [];
  do {
      var readBuffer = new Buffer(this.options.readChunk);

      bytesRead = fs.readSync(this.fd, readBuffer, 0, this.options.readChunk, this.fdPosition);
      totalBytesRead = totalBytesRead + bytesRead;

      this.fdPosition = this.fdPosition + bytesRead;

      buffers.push(readBuffer);
  } while (bytesRead && !this._reachedEndOfAtLeastOneLine(buffers[buffers.length-1], this.options.newLineCharacter));

  var bufferData = Buffer.concat(buffers);

  if (bytesRead < this.options.readChunk) {
      this.eofReached = true;
      bufferData = bufferData.slice(0, totalBytesRead);
  }

  if (bytesRead) {
      this.linesCache = this._extractLines(bufferData);
  }
};

LineByLine.prototype.next = function() {
  var line = false;

  if (this.eofReached && this.linesCache.length === 0) {
      return line;
  }

  if (!this.linesCache.length) {
      this._readChunk();
  }

  if (this.linesCache.length) {
      line = this.linesCache.shift();
  }

  function lastLineCharacter() {
    return line && line[line.length-1];
  }

   // if last character in line is not a line ending
   // get rest of line, if there are lines to get
  if (!this.eofReached && lastLineCharacter() !== this.newLineCharacter) {
      var bytesRead = this._readChunk();

      var restOfLine = this.linesCache.shift();
      line = Buffer.concat([line, restOfLine]);
  }

  // if last character in line is a line ending
  // get rid of endOfLineCharacter
  if (lastLineCharacter() === this.newLineCharacter) {
      line = line.slice(0, line.length-1);
  }

  if (this.eofReached && this.linesCache.length === 0) {
    fs.closeSync(this.fd);
    this.fd = null;
  }

  return line;
};

module.exports = LineByLine;