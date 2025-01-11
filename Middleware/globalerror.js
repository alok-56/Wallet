const globalErrHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 11000) {
    const message = `Duplicate value error: ${
      Object.keys(err.keyValue)[0]
    } already exists.`;
    return res.status(400).json({
      status: false,
      code: 400,
      message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  }

  // Handle other errors
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "Internal Server Error";
  const stack = err.stack;

  return res.status(statusCode).json({
    status: status === "error" ? false : true,
    code: statusCode,
    message,
    stack: process.env.NODE_ENV === "production" ? null : stack,
  });
};

module.exports = globalErrHandler;
