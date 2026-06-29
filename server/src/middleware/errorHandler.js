const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let code = 'SERVER_ERROR';

  // Handle specific errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
    code = 'INVALID_ID';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    code = 'DUPLICATE_ERROR';
  } else if (err.message.includes('Invalid file type')) {
    statusCode = 400;
    code = 'INVALID_FILE_TYPE';
  } else if (err.message === 'File too large') {
    statusCode = 400;
    code = 'FILE_TOO_LARGE';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code
    }
  });
};

module.exports = errorHandler;
