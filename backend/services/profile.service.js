const profileRepository = require("../repository/profile.repository");
const AppError = require("./utils/appError");

class ProfileService {
  async getByUserId(userId) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      throw new AppError("Perfil no encontrado.", 404, "PROFILE_NOT_FOUND");
    }

    return profile;
  }

  async createForUser(userId, data = {}, { session = null } = {}) {
    const existing = await profileRepository.findByUserId(userId, { session });

    if (existing) {
      throw new AppError(
        "El usuario ya tiene un perfil asociado.",
        409,
        "PROFILE_EXISTS"
      );
    }

    // Si existiera un perfil soft-deleted, upsert lo reutiliza.
    return profileRepository.upsertByUserId(userId, data, { session });
  }

  async updateForUser(userId, data = {}, { session = null } = {}) {
    return profileRepository.upsertByUserId(userId, data, { session });
  }

  async softDeleteForUser(userId, { session = null } = {}) {
    return profileRepository.softDeleteByUserId(userId, { session });
  }

  async restoreForUser(userId, { session = null } = {}) {
    return profileRepository.restoreByUserId(userId, { session });
  }
}

module.exports = new ProfileService();
