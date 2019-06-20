/**
 * Represents an error raised when the config fail to validate
 * @memberof module:Errors
 *
 * @constructor
 * @param {string} message - the error message
 * @param {array} cause - the resumed root cause
 */
class InvalidConfigError extends Error {
  constuctor(message, cause) {
    this.message = message;
    this.cause = cause;
  }
}

module.exports = {
  InvalidConfigError
};
