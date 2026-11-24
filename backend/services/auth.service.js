const mongoose = require("mongoose");

const userService = require("./user.service");
const userRepository = require("../repository/user.repository");
const revokedTokenRepository = require("../repository/revokedToken.repository");
const AppError = require("./utils/appError");
const { verifyPassword } = require("../utils/password");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken
} = require("../utils/jwt");

function invalidCredentials() {
  return new AppError(
    "Email o contraseña incorrectos.",
    401,
    "INVALID_CREDENTIALS"
  );
}

// Sirve tanto para documentos de Mongoose como para el objeto que devuelve UserService.
function toSafeUser(user) {
  const plain = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete plain.password_hash;
  delete plain.token_version;
  return plain;
}

class AuthService {
  // El rol se impone aquí: nunca se toma del body del registro.
  async register(data) {
    return userService.create({ ...data, role: "Client" });
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, {
      includePassword: true
    });

    if (!user || !user.password_hash) {
      throw invalidCredentials();
    }

    if (user.deleted_at) {
      throw invalidCredentials();
    }

    if (user.status === "blocked") {
      throw new AppError(
        "Tu cuenta está bloqueada. Contacta con un administrador.",
        403,
        "USER_BLOCKED"
      );
    }

    if (!user.is_active || user.status !== "active") {
      throw new AppError(
        "Tu cuenta no está activa. Contacta con un administrador.",
        403,
        "USER_INACTIVE"
      );
    }

    const passwordMatches = await verifyPassword(user.password_hash, password);
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    const tokenData = {
      userId: user._id,
      role: user.role,
      tokenVersion: user.token_version
    };

    // Admin solo recibe access token; Client recibe access + refresh.
    const { token, expiresAt } = signAccessToken(tokenData);
    const result = { token, expiresAt, user: toSafeUser(user) };

    if (user.role === "Client") {
      const refresh = signRefreshToken(tokenData);
      result.refreshToken = refresh.token;
      result.refreshExpiresAt = refresh.expiresAt;
    }

    return result;
  }

  async refresh(refreshToken) {
    if (typeof refreshToken !== "string" || !refreshToken.trim()) {
      throw new AppError("No hay una sesión que renovar.", 401, "UNAUTHORIZED");
    }

    const payload = verifyRefreshToken(refreshToken.trim());

    if (!payload.sub || !mongoose.Types.ObjectId.isValid(String(payload.sub))) {
      throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
    }

    const tokenHash = hashToken(refreshToken.trim());
    const isRevoked = await revokedTokenRepository.existsByHash(tokenHash);
    if (isRevoked) {
      throw new AppError(
        "El token ha sido revocado.",
        401,
        "TOKEN_REVOKED"
      );
    }

    // El rol se comprueba en la BD, nunca en el token ni en el frontend.
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
    }

    if (user.role !== "Client") {
      throw new AppError(
        "Este tipo de usuario no puede renovar la sesión.",
        403,
        "REFRESH_NOT_ALLOWED"
      );
    }

    if (!user.is_active || user.status !== "active") {
      throw new AppError(
        "Tu cuenta no está activa.",
        403,
        "USER_INACTIVE"
      );
    }

    if ((payload.ver ?? 0) !== (user.token_version ?? 0)) {
      throw new AppError(
        "El token ha sido revocado.",
        401,
        "TOKEN_REVOKED"
      );
    }

    const { token, expiresAt } = signAccessToken({
      userId: user._id,
      role: user.role,
      tokenVersion: user.token_version
    });

    return { token, expiresAt, user: toSafeUser(user) };
  }

  async logout({ tokenHash, userId, exp, refreshToken }) {
    const expiresAt = new Date(Number(exp) * 1000);

    if (!tokenHash || !userId || Number.isNaN(expiresAt.getTime())) {
      throw new AppError(
        "No se pudo revocar el token.",
        400,
        "INVALID_TOKEN"
      );
    }

    await revokedTokenRepository.revoke({
      tokenHash,
      userId,
      expiresAt,
      reason: "logout"
    });

    if (!refreshToken) return;

    try {
      const payload = verifyRefreshToken(refreshToken);

      if (String(payload.sub) === String(userId)) {
        await revokedTokenRepository.revoke({
          tokenHash: hashToken(refreshToken),
          userId,
          expiresAt: new Date(Number(payload.exp) * 1000),
          reason: "logout"
        });
      }
    } catch {
      // Un refresh caducado o inválido no impide cerrar la sesión.
    }
  }
}

module.exports = new AuthService();
