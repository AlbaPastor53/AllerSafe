const locationRepository = require("../repository/location.repository");
const AppError = require("./utils/appError");
const { buildUniqueSlug } = require("./utils/slug");

class LocationService {
  async getAll(options = {}) {
    return locationRepository.findAll(options);
  }

  async getById(id) {
    try {
      const location = await locationRepository.findById(id);
      if (!location) throw new AppError("Ubicación no encontrada.", 404, "LOCATION_NOT_FOUND");
      return location;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === "CastError") {
        throw new AppError("ID de ubicación no válido.", 400, "INVALID_ID");
      }
      throw error;
    }
  }

  async getBySlug(slug) {
    const location = await locationRepository.findBySlug(slug);
    if (!location) {
      throw new AppError("Ubicación no encontrada para ese slug.", 404, "LOCATION_NOT_FOUND");
    }
    return location;
  }

  async create(data) {
    const slug = await buildUniqueSlug(locationRepository, data.slug || data.name);
    if (!slug) {
      throw new AppError("No se puede generar un slug válido.", 400, "INVALID_SLUG");
    }

    return locationRepository.create({
      ...data,
      slug,
      status: data.status ?? "active",
      is_active: data.is_active ?? true
    });
  }

  async update(id, data) {
    const current = await this.getById(id);
    const updateData = { ...data };

    if (data.name || data.slug) {
      updateData.slug = await buildUniqueSlug(
        locationRepository,
        data.slug || data.name,
        current._id
      );
    }

    return locationRepository.updateById(id, updateData);
  }

  async softDelete(id) {
    const location = await locationRepository.findById(id, { includeDeleted: true });

    if (!location) {
      throw new AppError("Ubicación no encontrada.", 404, "LOCATION_NOT_FOUND");
    }

    if (location.deleted_at) return false;

    await locationRepository.softDelete(id);
    return true;
  }
}

module.exports = new LocationService();
