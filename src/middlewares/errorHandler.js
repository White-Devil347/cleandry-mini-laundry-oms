function notFoundHandler(req, res) {
  return res.status(404).json({
    message: "Route not found"
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
