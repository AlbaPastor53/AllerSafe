function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Error interno del servidor.";

  if (err.name === "ValidationError" || err.name === "CastError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
  }

  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_KEY";
    message = "Ya existe un registro con esos datos únicos.";
  }

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
