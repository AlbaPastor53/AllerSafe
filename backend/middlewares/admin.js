const AppError = require("../services/utils/appError");

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError(
          "Debes iniciar sesión para acceder.",
          401,
          "UNAUTHORIZED"
        )
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "No tienes permisos para realizar esta acción.",
          403,
          "FORBIDDEN"
        )
      );
    }

    return next();
  };
}

function admin(req, res, next) {
  return requireRole("Admin")(req, res, next);
}

module.exports = {
  admin,
  requireRole
};
