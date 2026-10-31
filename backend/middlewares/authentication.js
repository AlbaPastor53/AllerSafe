const AppError = require("../services/utils/appError");
const userRepository = require("../repository/user.repository");
const revokedTokenRepository = require("../repository/revokedToken.repository");
const { verifyAccessToken, hashToken } = require("../utils/jwt");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

function extractToken(req) {
  const header = req.headers.authorization;

  if (!header || typeof header !== "string") return null;

  const [scheme, token] = header.split(" ");
  if (!token || scheme.toLowerCase() !== "bearer") return null;

  return token.trim();
}

async function authentication(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AppError(
        "Debes iniciar sesión para acceder.",
        401,
        "UNAUTHORIZED"
      );
    }

    const payload = verifyAccessToken(token);

    if (
      !payload ||
      !payload.sub ||
      !payload.role ||
      !objectIdRegex.test(String(payload.sub))
    ) {
      throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
    }

    // La blacklist guarda SHA-256(token), nunca el JWT completo.
    const tokenHash = hashToken(token);

    const isRevoked = await revokedTokenRepository.existsByHash(tokenHash);
    if (isRevoked) {
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
      tokenHash,
      exp: payload.exp
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authentication,
  extractToken
};
