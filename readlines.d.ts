declare class LineByLine {
  /**
   * File descriptor. Set to `null` after the file is closed.
   */
  fd: number | null;

  /**
   * Creates a new line-by-line file reader.
   * Automatically handles LF (\n), CRLF (\r\n), and CR (\r) line endings.
   * @param file - Path to file or file descriptor
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
   */
  reset(): void;

  /**
   * Manually closes the file. Subsequent `next()` calls will return `null`.
   */
  close(): void;
}

export = LineByLine;
