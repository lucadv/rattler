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

class NotImplementedError extends Error {}

/**
 * Represents an error raised when the remote request to load a page
 * returns a status code out of the range of 2xx
 * @memberof module:Errors
 *
 * @constructor
 * @param {string} message - the error message
 * @param {integer} statusCode - the statusCode of the response
 * @param {object/string} reason - the reason why the request failed, may be an object or a string
 */
class ResponseError extends Error {
  constructor(message, statusCode, cause = null) {
    super(message);
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

/**
 * Represents an error raised when a remote request was made but a response was not received
 * @memberof module:Errors
 *
 * @constructor
 * @param {string} message - the error message
 */
class RequestTimeoutError extends Error {}

/**
 * Represents an error when something happened in setting up the request that triggered an Error
 * @memberof module:Errors
 *
 * @constructor
 * @param {string} message - the error message
 * @param {string} cause - the error cause
 */
class RequestError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
  }
}

/**
 * Represents an error when Cheerio could not load the data passed as result of requesting a page
 * @memberof module:Errors
 *
 * @constructor
 * @param {string} message - the error message
 * @param {string} cause - the error cause
 */
class DOMLoaderError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
  }
}

module.exports = {
  InvalidConfigError,
  NotImplementedError,
  ResponseError,
  RequestTimeoutError,
  RequestError,
  DOMLoaderError
};
