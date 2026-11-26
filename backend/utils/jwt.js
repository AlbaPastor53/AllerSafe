const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const AppError = require("../services/utils/appError");

const MIN_SECRET_LENGTH = 32;

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

// Duración fija de cada token (en segundos para JWT y en ms para la cookie).
const ACCESS_TOKEN_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function cookieOptions(maxAge, path) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path,
    maxAge
  };
}

function getAccessTokenCookieOptions() {
  return cookieOptions(ACCESS_TOKEN_MAX_AGE, "/api");
}

function getRefreshTokenCookieOptions() {
  return cookieOptions(REFRESH_TOKEN_MAX_AGE, "/api/auth");
}

function getSecret(envName) {
  const secret = process.env[envName];

  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new AppError(
      "La configuración de autenticación no está disponible.",
      500,
      "AUTH_NOT_CONFIGURED"
    );
  }

  return secret;
}

function getAccessTokenSecret() {
  return getSecret("JWT_SECRET");
}

function getRefreshTokenSecret() {
  return getSecret("JWT_REFRESH_SECRET");
}

function signToken(payload, secret, expiresIn) {
  const token = jwt.sign(payload, secret, { expiresIn });
  const decoded = jwt.decode(token);

  return {
    token,
    expiresAt: decoded && decoded.exp ? new Date(decoded.exp * 1000) : null
  };
}

function signAccessToken({ userId, role, tokenVersion = 0 }) {
  return signToken(
    {
      sub: String(userId),
      role,
      ver: Number(tokenVersion) || 0
    },
    getAccessTokenSecret(),
    ACCESS_TOKEN_EXPIRES_IN
  );
}

// typ sirve para que un access token nunca pueda usarse como refresh token.
function signRefreshToken({ userId, role, tokenVersion = 0 }) {
  return signToken(
    {
      sub: String(userId),
      role,
      ver: Number(tokenVersion) || 0,
      typ: "refresh"
    },
    getRefreshTokenSecret(),
    REFRESH_TOKEN_EXPIRES_IN
  );
}

function verifyWithSecret(token, secret, expiredMessage, options = {}) {
  try {
    return jwt.verify(token, secret, options);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError(expiredMessage, 401, "TOKEN_EXPIRED");
    }

    throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
  }
}

// `ignoreExpiration` se usa solo en /auth/renew: la firma sigue siendo
// obligatoria, pero se permite rotar un access recién caducado.
function verifyAccessToken(token, options = {}) {
  return verifyWithSecret(
    token,
    getAccessTokenSecret(),
    "La sesión ha caducado.",
    options
  );
}

function verifyRefreshToken(token) {
  const payload = verifyWithSecret(
    token,
    getRefreshTokenSecret(),
    "La sesión ha caducado."
  );

  if (payload.typ !== "refresh") {
    throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
  }

  return payload;
}

function hashToken(token) {
  if (typeof token !== "string" || token.length === 0) {
    throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
  }

  return crypto.createHash("sha256").update(token).digest("hex");
}

function validateJwtConfig() {
  getAccessTokenSecret();
  getRefreshTokenSecret();
}

module.exports = {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  validateJwtConfig
};
