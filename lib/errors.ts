/**
 * Base error class for all errors thrown by the Veganify API client.
 *
 * @remarks
 * The `cause` option is forwarded to the native `Error` constructor so
 * `error.cause` is set.
 */
export class VeganifyError extends Error {
  /** HTTP status code associated with the error, if any. */
  readonly statusCode?: number;

  /**
   * @param message - Human-readable error description.
   * @param statusCode - HTTP status code associated with the error, if any.
   * @param cause - The underlying error or value that triggered this error.
   */
  constructor(message: string, statusCode?: number, cause?: unknown) {
    super(message, { cause });
    this.statusCode = statusCode;
    this.name = "VeganifyError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the request payload or the API response fails schema validation.
 * Maps to HTTP 400.
 */
export class ValidationError extends VeganifyError {
  constructor(message: string, cause?: unknown) {
    super(message, 400, cause);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the requested resource does not exist.
 * Maps to HTTP 404.
 */
export class NotFoundError extends VeganifyError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
