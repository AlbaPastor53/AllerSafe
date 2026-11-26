const mongoose = require("mongoose");

const userService = require("./user.service");
const userRepository = require("../repository/user.repository");
const tokenRepository = require("../repository/token.repository");
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
    const accessHash = hashToken(token);

    await tokenRepository.registerAccess({
      tokenHash: accessHash,
      userId: user._id,
      expiresAt
    });

    const result = { token, expiresAt, user: toSafeUser(user) };

    if (user.role === "Client") {
      const refresh = signRefreshToken(tokenData);
      result.refreshToken = refresh.token;
      result.refreshExpiresAt = refresh.expiresAt;

      await tokenRepository.registerRefresh({
        tokenHash: hashToken(refresh.token),
        userId: user._id,
        expiresAt: refresh.expiresAt,
        accessHash
      });
    }

    return result;
  }

  async refresh(refreshToken) {
    if (typeof refreshToken !== "string" || !refreshToken.trim()) {
      throw new AppError("No hay una sesión que renovar.", 401, "UNAUTHORIZED");
    }

    const refresh = refreshToken.trim();
    const tokenHash = hashToken(refresh);

    let payload;
    try {
      payload = verifyRefreshToken(refresh);
    } catch (error) {
      if (error.code === "TOKEN_EXPIRED") {
        // El JWT caducado ya no se puede verificar, pero su hash identifica
        // el registro: se revocan el refresh y su access antes de cerrar la sesión.
        await tokenRepository.revokeSessionByRefreshHash(tokenHash);
        throw new AppError(
          "La sesión ha caducado. Vuelve a iniciar sesión.",
          401,
          "SESSION_EXPIRED"
        );
      }
      throw error;
    }

    if (!payload.sub || !mongoose.Types.ObjectId.isValid(String(payload.sub))) {
      throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
    }

    const refreshRecord = await tokenRepository.findRefresh(tokenHash);
    if (!refreshRecord || refreshRecord.revoked) {
      await tokenRepository.revokeSessionByRefreshHash(tokenHash);
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
      await tokenRepository.revokeSessionByRefreshHash(tokenHash);
      throw new AppError(
        "El token ha sido revocado.",
        401,
        "TOKEN_REVOKED"
      );
    }

    // Se revoca el access token anterior para que solo quede uno vigente.
    if (refreshRecord.access_hash) {
      await tokenRepository.revokeAccess(refreshRecord.access_hash);
    }

    const { token, expiresAt } = signAccessToken({
      userId: user._id,
      role: user.role,
      tokenVersion: user.token_version
    });
    const accessHash = hashToken(token);

    await tokenRepository.registerAccess({
      tokenHash: accessHash,
      userId: user._id,
      expiresAt
    });
    await tokenRepository.setRefreshAccessHash(tokenHash, accessHash);

    return { token, expiresAt, user: toSafeUser(user) };
  }

  // Renovación preventiva del Admin: se llama con el access todavía vigente
  // (middleware authentication), por lo que no interviene ningún refresh token.
  async renewAccess({ userId, tokenHash }) {
    if (!userId || !tokenHash) {
      throw new AppError(
        "No se pudo renovar la sesión.",
        400,
        "INVALID_TOKEN"
      );
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("El token no es válido.", 401, "INVALID_TOKEN");
    }

    if (user.role !== "Admin") {
      throw new AppError(
        "Este tipo de usuario no puede renovar el access por esta vía.",
        403,
        "RENEW_NOT_ALLOWED"
      );
    }

    if (!user.is_active || user.status !== "active") {
      throw new AppError(
        "Tu cuenta no está activa.",
        403,
        "USER_INACTIVE"
      );
    }

    // El access anterior no se revoca aquí: sigue vigente hasta su caducidad
    // natural para no provocar un 401 en peticiones ya en vuelo (p. ej. /me).
    const { token, expiresAt } = signAccessToken({
      userId: user._id,
      role: user.role,
      tokenVersion: user.token_version
    });

    await tokenRepository.registerAccess({
      tokenHash: hashToken(token),
      userId: user._id,
      expiresAt
    });

    return { token, expiresAt };
  }

  async logout({ tokenHash, userId, refreshToken }) {
    if (!tokenHash || !userId) {
      throw new AppError(
        "No se pudo revocar el token.",
        400,
        "INVALID_TOKEN"
      );
    }

    await tokenRepository.revokeAccess(tokenHash);

    if (!refreshToken) return;

    try {
      const payload = verifyRefreshToken(refreshToken);

      if (String(payload.sub) === String(userId)) {
        await tokenRepository.revokeRefresh(hashToken(refreshToken));
      }
    } catch {
      // Un refresh caducado o inválido no impide cerrar la sesión.
    }
  }
}

module.exports = new AuthService();
