const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, please try again later',
  };
  // Validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map((error) => error.message)
      .join(', ');
    customError = {
      statusCode: StatusCodes.BAD_REQUEST,
      msg: messages,
    };
  }
  // Duplicate value error
  if (err?.code === 11000) {
    customError = {
      statusCode: StatusCodes.BAD_REQUEST,
      msg: `Duplicate value entered for ${Object.keys(
        err.keyValue
      )} field, please choose another value`,
    };
  }
  // Cast error
  if (err.name === 'CastError') {
    customError = {
      statusCode: StatusCodes.NOT_FOUND,
      msg: `No item found with id: ${err.value}`,
    };
  }
  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
