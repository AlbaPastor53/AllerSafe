const userRepository = require("../repository/user.repository");
const AppError = require("./utils/appError");

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
    return userRepository.create(data);
  }

  async update(id, data) {
    await this.getById(id);
    if (data.email) {
      const existing = await userRepository.findByEmail(data.email, { includeDeleted: true });
      if (existing && String(existing._id) !== String(id)) {
        throw new AppError("Ya existe otro usuario con ese email.", 409, "EMAIL_EXISTS");
      }
    }
    return userRepository.updateById(id, data);
  }

  async activate(id) {
    await this.getById(id);
    return userRepository.setActive(id, true);
  }

  async deactivate(id) {
    await this.getById(id);
    return userRepository.setActive(id, false);
  }

  async softDelete(id) {
    await this.getById(id);
    const deleted = await userRepository.softDelete(id);
    if (!deleted) {
      throw new AppError("No se pudo eliminar usuario.", 500, "DELETE_FAILED");
    }
    return deleted;
  }
}

module.exports = new UserService();
