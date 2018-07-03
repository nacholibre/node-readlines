// Type definitions for n-readlines
// Project: n-readlines
// Definitions by: HPDell https://github.com/hpdell

/*~ This is the module template file for class modules.
 *~ You should rename it to index.d.ts and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ Note that ES6 modules cannot directly export class objects.
 *~ This file should be imported using the CommonJS-style:
 *~   import x = require('someLibrary');
 *~
 *~ Refer to the documentation to understand common
 *~ workarounds for this limitation of ES6 modules.
 */

/*~ If this module is a UMD module that exposes a global variable 'myClassLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
// export as namespace nReadlines;

/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */

/**
 * Read Line Object.
 */
declare class LineByLine {
    /**
     * Create read line object.
     * @param file String path to the file you want to read from
     * @param options Object
     */
    constructor(file: string, options?: LineByLineConstructOptions);

    /**
     * Create read line object.
     * @param file File descriptor
     * @param options Object
     */
    constructor(file: number, options?: LineByLineConstructOptions);

    /**
     * Resets the pointer and starts from the beginning of the file.
     * This works only if the end is not reached.
     */
    reset(): void;

    /**
     * Manually close the open file, subsequent next() calls will return false.
     * This works only if the end is not reached.
     */
    close(): void;

    /**
     * Returns buffer with the line data without the newLineCharacter or false
     * if end of file is reached.
     */
    next(): string
}


/**
 * Read line object construct options.
 */
interface LineByLineConstructOptions {
    /**
     * Integer number of bytes to read at once. Default: 1024
     */
    readChunk?: number;

    /**
     * String new line character, only works with one byte characters for now.
     * Default: \n which is 0x0a hex encoded.
     */
    newLineCharacter?: number;
}

export = LineByLine;