const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const AppError = require("../services/utils/appError");

const MIN_SECRET_LENGTH = 32;
const DEFAULT_EXPIRES_IN = "1h";

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new AppError(
      "La configuración de autenticación no está disponible.",
      500,
      "AUTH_NOT_CONFIGURED"
    );
  }

  return secret;
}

function getExpiresIn() {
  return process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;
}

function signAccessToken({ userId, role, tokenVersion = 0 }) {
  const token = jwt.sign(
    {
      sub: String(userId),
      role,
      ver: Number(tokenVersion) || 0
    },
    getSecret(),
    { expiresIn: getExpiresIn() }
  );

  const decoded = jwt.decode(token);

  return {
    token,
    expiresAt: decoded && decoded.exp ? new Date(decoded.exp * 1000) : null
  };
}

function verifyAccessToken(token) {
  const secret = getSecret();

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("La sesión ha caducado.", 401, "TOKEN_EXPIRED");
    }

    throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
  }
}

function hashToken(token) {
  if (typeof token !== "string" || token.length === 0) {
    throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
  }

  return crypto.createHash("sha256").update(token).digest("hex");
}

function validateJwtConfig() {
  getSecret();
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  hashToken,
  validateJwtConfig
};
