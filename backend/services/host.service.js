const hostRepository = require("../repository/host.repository");
const userRepository = require("../repository/user.repository");
const AppError = require("./utils/appError");
const { buildUniqueSlug } = require("./utils/slug");

const HOST_POPULATE = {
  path: "user_id",
  select: "name email role status is_active"
};

class HostService {
  async getAll(options = {}) {
    const hosts = await hostRepository.findAll(options);
    await Promise.all(hosts.map((host) => host.populate(HOST_POPULATE)));
    return hosts;
  }

  async getById(id) {
    try {
      const host = await hostRepository.findById(id);
      if (!host) throw new AppError("Anfitrión no encontrado.", 404, "HOST_NOT_FOUND");
      await host.populate(HOST_POPULATE);
      return host;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === "CastError") {
        throw new AppError("ID de anfitrión no válido.", 400, "INVALID_ID");
      }
      throw error;
    }
  }

  async getBySlug(slug) {
    const host = await hostRepository.findBySlug(slug);
    if (!host) {
      throw new AppError("Anfitrión no encontrado para ese slug.", 404, "HOST_NOT_FOUND");
    }
    await host.populate(HOST_POPULATE);
    return host;
  }

  async create(data) {
    const user = await userRepository.findById(data.user_id);
    if (!user) {
      throw new AppError("El usuario indicado no existe.", 404, "USER_NOT_FOUND");
    }

    const existing = await hostRepository.findByUserId(data.user_id, { includeDeleted: true });
    if (existing) {
      throw new AppError("Ese usuario ya tiene un anfitrión asociado.", 409, "HOST_EXISTS");
    }

    const slug = await buildUniqueSlug(
      hostRepository,
      data.slug || user.name || user.email
    );

    if (!slug) {
      throw new AppError("No se puede generar un slug válido.", 400, "INVALID_SLUG");
    }

    const host = await hostRepository.create({
      ...data,
      slug,
      status: data.status ?? "active",
      is_active: data.is_active ?? true
    });

    await userRepository.setHostId(user._id, host._id);

    await host.populate(HOST_POPULATE);
    return host;
  }

  async update(id, data) {
    const current = await this.getById(id);
    const updateData = { ...data };
    const currentUserId = current.user_id
      ? String(current.user_id._id ?? current.user_id)
      : null;

    if (data.user_id && String(data.user_id) !== currentUserId) {
      const user = await userRepository.findById(data.user_id);
      if (!user) {
        throw new AppError("El usuario indicado no existe.", 404, "USER_NOT_FOUND");
      }

      const existing = await hostRepository.findByUserId(data.user_id, { includeDeleted: true });
      if (existing && String(existing._id) !== String(id)) {
        throw new AppError("Ese usuario ya tiene un anfitrión asociado.", 409, "HOST_EXISTS");
      }

      if (currentUserId) {
        await userRepository.setHostId(currentUserId, null);
      }

      await userRepository.setHostId(data.user_id, id);
    }

    if (data.slug) {
      updateData.slug = await buildUniqueSlug(hostRepository, data.slug, current._id);
    }

    const host = await hostRepository.updateById(id, updateData);
    await host.populate(HOST_POPULATE);
    return host;
  }

  async softDelete(id) {
    const host = await hostRepository.findById(id, { includeDeleted: true });

    if (!host) {
      throw new AppError("Anfitrión no encontrado.", 404, "HOST_NOT_FOUND");
    }

    if (host.deleted_at) return false;

    await hostRepository.softDelete(id);
    await userRepository.setHostId(host.user_id, null);
    return true;
  }
}

module.exports = new HostService();
