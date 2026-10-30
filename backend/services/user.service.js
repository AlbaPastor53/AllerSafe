const argon2 = require("argon2");

const userRepository = require("../repository/user.repository");
const AppError = require("./utils/appError");
const { buildUniqueSlug } = require("./utils/slug");

class UserService {
  async getAll(options = {}) {
    return userRepository.findAll(options);
  }

  async getById(id) {
    try {
      const user = await userRepository.findById(id);
      if (!user) throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
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
    const existing = await userRepository.findByEmail(data.email, { includeDeleted: true });
    if (existing) {
      throw new AppError("Ya existe un usuario con ese email.", 409, "EMAIL_EXISTS");
    }

    const slug = await buildUniqueSlug(userRepository, data.slug || data.name || data.email);
    if (!slug) {
      throw new AppError("No se puede generar un slug válido.", 400, "INVALID_SLUG");
    }

    const { password, ...rest } = data;
    const password_hash = await argon2.hash(password);

    return userRepository.create({
      ...rest,
      slug,
      password_hash,
      role: rest.role ?? "Client",
      status: rest.status ?? "active",
      is_active: rest.is_active ?? true
    });
  }

  async update(id, data) {
    const current = await this.getById(id);
    const { password, ...rest } = data;
    const updateData = { ...rest };

    if (data.email) {
      const existing = await userRepository.findByEmail(data.email, { includeDeleted: true });
      if (existing && String(existing._id) !== String(id)) {
        throw new AppError("Ya existe otro usuario con ese email.", 409, "EMAIL_EXISTS");
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
      updateData.password_hash = await argon2.hash(password);
    }

    return userRepository.updateById(id, updateData);
  }

  async softDelete(id) {
    const user = await userRepository.findById(id, { includeDeleted: true });

    if (!user) {
      throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
    }

    if (user.deleted_at) return false;

    await userRepository.setHostId(id, null);
    await userRepository.softDelete(id);
    return true;
  }
}

module.exports = new UserService();
