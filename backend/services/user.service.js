const userRepository = require("../repository/user.repository");
const hostRepository = require("../repository/host.repository");
const profileService = require("./profile.service");
const AppError = require("./utils/appError");
const { buildUniqueSlug } = require("./utils/slug");
const { hashPassword } = require("../utils/password");
const { withTransaction } = require("../utils/transaction");

function toSafeUser(user) {
  const safeUser = user.toObject();
  delete safeUser.password_hash;
  delete safeUser.token_version;
  return safeUser;
}

class UserService {
  async getAll(options = {}) {
    return userRepository.findAll(options);
  }

  async getById(id, { includeDeleted = false } = {}) {
    try {
      const user = await userRepository.findById(id, { includeDeleted });
      if (!user) throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
      if (user.deleted_at) {
        throw new AppError(
          "No se puede modificar un usuario eliminado.",
          409,
          "RECORD_DELETED"
        );
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === "CastError") {
        throw new AppError("ID de usuario no válido.", 400, "INVALID_ID");
      }
      throw error;
    }
  }

  async create(data) {
    const existing = await userRepository.findByEmail(data.email, {
      includeDeleted: true
    });
    if (existing) {
      throw new AppError(
        "Ya existe un usuario con ese email.",
        409,
        "EMAIL_EXISTS"
      );
    }

    const slug = await buildUniqueSlug(
      userRepository,
      data.slug || data.name || data.email
    );
    if (!slug) {
      throw new AppError(
        "No se puede generar un slug válido.",
        400,
        "INVALID_SLUG"
      );
    }

    const { password, profile, ...rest } = data;
    const password_hash = await hashPassword(password);

    let status = rest.status;
    let is_active = rest.is_active;

    if (status !== undefined) {
      is_active = status === "active";
    } else if (is_active !== undefined) {
      status = is_active ? "active" : "inactive";
    } else {
      status = "active";
      is_active = true;
    }

    return withTransaction(async (session) => {
      const user = await userRepository.create(
        {
          ...rest,
          slug,
          password_hash,
          role: rest.role ?? "Client",
          status,
          is_active,
          token_version: 0
        },
        { session }
      );

      const createdProfile = await profileService.createForUser(
        user._id,
        profile || {},
        { session }
      );

      return { ...toSafeUser(user), profile: createdProfile };
    });
  }

  async update(id, data) {
    const current = await this.getById(id, { includeDeleted: true });
    const { password, profile, ...rest } = data;
    const updateData = { ...rest };

    if (data.email) {
      const existing = await userRepository.findByEmail(data.email, {
        includeDeleted: true
      });
      if (existing && String(existing._id) !== String(id)) {
        throw new AppError(
          "Ya existe otro usuario con ese email.",
          409,
          "EMAIL_EXISTS"
        );
      }
    }

    if (data.name || data.slug) {
      updateData.slug = await buildUniqueSlug(
        userRepository,
        data.slug || data.name,
        current._id
      );
    }

    if (password) {
      updateData.password_hash = await hashPassword(password);
    }

    // status es la fuente de verdad; is_active se deriva para evitar
    // combinaciones incoherentes.
    if (updateData.status !== undefined) {
      updateData.is_active = updateData.status === "active";
    } else if (updateData.is_active !== undefined) {
      updateData.status = updateData.is_active ? "active" : "inactive";
    }

    const securityChanged =
      Boolean(password) ||
      (updateData.email !== undefined && updateData.email !== current.email) ||
      (updateData.role !== undefined && updateData.role !== current.role) ||
      (updateData.status !== undefined && updateData.status !== current.status) ||
      (updateData.is_active !== undefined &&
        updateData.is_active !== current.is_active);

    return withTransaction(async (session) => {
      let updatedUser = await userRepository.updateById(id, updateData, {
        session
      });

      if (!updatedUser) {
        throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
      }

      if (securityChanged) {
        updatedUser = await userRepository.incrementTokenVersion(id, {
          session
        });
      }

      if (!updatedUser) {
        throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
      }

      let updatedProfile = null;
      if (profile !== undefined) {
        updatedProfile = await profileService.updateForUser(id, profile, {
          session
        });
      }

      const safeUser = toSafeUser(updatedUser);

      return updatedProfile
        ? { ...safeUser, profile: updatedProfile }
        : safeUser;
    });
  }

  async softDelete(id) {
    const user = await userRepository.findById(id, { includeDeleted: true });

    if (!user) {
      throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
    }

    if (user.deleted_at) return false;

    const hostCount = await hostRepository.countByUserId(id);
    if (hostCount > 0) {
      throw new AppError(
        "No se puede eliminar un usuario que tiene un anfitrión asociado.",
        409,
        "USER_HAS_HOST"
      );
    }

    return withTransaction(async (session) => {
      await userRepository.setHostId(id, null, { session });
      await userRepository.softDelete(id, { session });
      await profileService.softDeleteForUser(id, { session });
      return true;
    });
  }

  async restore(id) {
    const user = await userRepository.findById(id, { includeDeleted: true });

    if (!user) {
      throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
    }

    if (!user.deleted_at) {
      throw new AppError("El usuario no está eliminado.", 409, "ALREADY_ACTIVE");
    }

    const existing = await userRepository.findByEmail(user.email);
    if (existing) {
      throw new AppError(
        "Ya existe un usuario activo con ese email.",
        409,
        "RESTORE_CONFLICT"
      );
    }

    return withTransaction(async (session) => {
      const restored = await userRepository.restoreById(id, { session });
      await profileService.restoreForUser(id, { session });
      return restored;
    });
  }

  async changeStatus(id, status) {
    const user = await userRepository.findById(id, { includeDeleted: true });

    if (!user) {
      throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
    }

    if (user.deleted_at) {
      throw new AppError(
        "No se puede cambiar el estado de un usuario eliminado.",
        409,
        "RECORD_DELETED"
      );
    }

    return userRepository.updateStatusById(id, status);
  }
}

module.exports = new UserService();
