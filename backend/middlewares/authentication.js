const AppError = require("../services/utils/appError");
const userRepository = require("../repository/user.repository");
const tokenRepository = require("../repository/token.repository");
const {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  verifyAccessToken,
  hashToken
} = require("../utils/jwt");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

function extractToken(req) {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

function extractRefreshToken(req) {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

async function authenticate(req, { ignoreExpiration = false } = {}) {
  const token = extractToken(req);

  if (!token) {
    throw new AppError(
      "Debes iniciar sesión para acceder.",
      401,
      "UNAUTHORIZED"
    );
  }

  const payload = verifyAccessToken(
    token,
    ignoreExpiration ? { ignoreExpiration: true } : {}
  );

  if (
    !payload ||
    !payload.sub ||
    !payload.role ||
    !objectIdRegex.test(String(payload.sub))
  ) {
    throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
  }

  // La BD guarda SHA-256(token), nunca el JWT completo.
  // Además de la cookie y la firma, el token debe estar vigente en la BD.
  const tokenHash = hashToken(token);

  const isActive = await tokenRepository.isAccessActive(tokenHash);
  if (!isActive) {
    throw new AppError(
      "El token ha sido revocado.",
      401,
      "TOKEN_REVOKED"
    );
  }

  const user = await userRepository.findById(payload.sub);

  if (!user) {
    throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
  }

  if (!user.is_active || user.status !== "active") {
    throw new AppError(
      "Tu cuenta no está activa.",
      403,
      "USER_INACTIVE"
    );
  }

  // Si cambió la contraseña, el rol, el estado o se eliminó la cuenta,
  // token_version invalida todos los tokens anteriores.
  if ((payload.ver ?? 0) !== (user.token_version ?? 0)) {
    throw new AppError(
      "El token ha sido revocado.",
      401,
      "TOKEN_REVOKED"
    );
  }

  req.user = {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    is_active: user.is_active,
    host_id: user.host_id ? String(user.host_id) : null
  };

  req.auth = {
    tokenHash
  };
}

async function authentication(req, res, next) {
  try {
    await authenticate(req);
    next();
  } catch (error) {
    next(error);
  }
}

// Solo para /auth/renew: admite un access caducado, pero exige firma válida,
// token no revocado en BD, usuario activo y token_version coincidente.
async function renewAuthentication(req, res, next) {
  try {
    await authenticate(req, { ignoreExpiration: true });
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authentication,
  renewAuthentication,
  extractToken,
  extractRefreshToken
};
