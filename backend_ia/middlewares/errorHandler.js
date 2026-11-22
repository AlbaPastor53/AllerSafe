function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Error interno del servidor.";

  if (statusCode >= 500) {
    console.error(err);
  }

  const body = {
    success: false,
    error: { code, message }
  };

  if (err.details) {
    body.error.details = err.details;
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
