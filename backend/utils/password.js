const argon2 = require("argon2");

const AppError = require("../services/utils/appError");

// Parámetros recomendados por OWASP para Argon2id.
// Los hashes antiguos siguen siendo válidos porque Argon2 guarda sus
// parámetros dentro del propio hash.
const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
};

async function hashPassword(plainPassword) {
  if (typeof plainPassword !== "string" || plainPassword.length === 0) {
    throw new AppError("La contraseña no es válida.", 400, "INVALID_PASSWORD");
  }

  return argon2.hash(plainPassword, HASH_OPTIONS);
}

async function verifyPassword(passwordHash, plainPassword) {
  if (
    typeof passwordHash !== "string" ||
    passwordHash.length === 0 ||
    typeof plainPassword !== "string" ||
    plainPassword.length === 0
  ) {
    return false;
  }

  try {
    return await argon2.verify(passwordHash, plainPassword);
  } catch {
    return false;
  }
}

module.exports = {
  HASH_OPTIONS,
  hashPassword,
  verifyPassword
};
