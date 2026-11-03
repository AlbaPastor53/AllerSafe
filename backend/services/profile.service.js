const profileRepository = require("../repository/profile.repository");
const AppError = require("./utils/appError");

class ProfileService {
  async getByUserId(userId) {
    const profile = await profileRepository.findByUserId(userId);

    if (profile) {
      return profile;
    }

    // El perfil se crea de forma perezosa la primera vez que se consulta,
    // para que cualquier usuario autenticado pueda completarlo desde la app.
    try {
      return await this.createForUser(userId, {});
    } catch (error) {
      // Si dos peticiones concurrentes intentan crearlo, reutilizamos el
      // perfil que ya haya quedado guardado.
      if (error?.code === 11000) {
        const existing = await profileRepository.findByUserId(userId);
        if (existing) return existing;
      }

      throw error;
    }
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
