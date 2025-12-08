declare class LineByLine {
  /**
   * File descriptor. Set to `null` after the file is closed.
   */
  fd: number | null;

  /**
   * Whether reading from stdin (fd 0).
   */
  readonly isStdin: boolean;

  /**
   * Creates a new line-by-line file reader.
   * Automatically handles LF (\n), CRLF (\r\n), and CR (\r) line endings.
   * Supports reading from stdin (fd 0).
   * @param file - Path to file, file descriptor, or 0 for stdin
   * @param options - Configuration options
   */
  constructor(
    file: string | number,
    options?: {
      /** Number of bytes to read at once. Default: 1024 */
      readChunk?: number;
    }
  );

  /**
   * Returns the next line as a Buffer, or `null` if end of file is reached.
   * The newline character is not included in the returned buffer.
   */
  next(): Buffer | null;

  /**
   * Resets the reader to the beginning of the file.
   * Note: reset() does not work with stdin.
   */
  reset(): void;

  /**
   * Manually closes the file. Subsequent `next()` calls will return `null`.
   * Note: Does not close stdin when reading from fd 0.
   */
  close(): void;

  /**
   * Returns true if the last line has been read and there are no more lines.
   */
  isLast(): boolean;
}

export = LineByLine;
