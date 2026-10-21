const AppError = require("../services/utils/appError");

function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }));

      return next(new AppError("Datos de entrada no válidos.", 400, "VALIDATION_ERROR"));
    }

    req[source] = result.data;
    next();
  };
}

module.exports = validate;
