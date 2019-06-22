/**
 * Represents an error raised when the config fail to validate
 * @memberof module:Errors
 *
 * @constructor
 * @param {string} message - the error message
 * @param {array} cause - the resumed root cause
 */
class InvalidConfigError extends Error {
  constructor(message, cause) {
    super(message);
    this.path = cause.path.join('.');
    this.context = cause.context;
  }
}

module.exports = {
  InvalidConfigError
};
