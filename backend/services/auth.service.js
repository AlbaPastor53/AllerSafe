const userRepository = require("../repository/user.repository");
const revokedTokenRepository = require("../repository/revokedToken.repository");
const AppError = require("./utils/appError");
const { verifyPassword } = require("../utils/password");
const { signAccessToken } = require("../utils/jwt");

function invalidCredentials() {
  return new AppError(
    "Email o contraseña incorrectos.",
    401,
    "INVALID_CREDENTIALS"
  );
}

class AuthService {
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

    const { token } = signAccessToken({
      userId: user._id,
      role: user.role,
      tokenVersion: user.token_version
    });

    const { password_hash, token_version, ...safeUser } = user.toObject();

    return { token, user: safeUser };
  }

  async logout({ tokenHash, userId, exp }) {
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
  }
}

module.exports = new AuthService();
