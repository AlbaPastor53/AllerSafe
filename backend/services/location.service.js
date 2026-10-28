const locationRepository = require("../repository/location.repository");
const AppError = require("./utils/appError");

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

  async create(data) {
    return locationRepository.create(data);
  }

  async update(id, data) {
    await this.getById(id);
    return locationRepository.updateById(id, data);
  }

  async activate(id) {
    await this.getById(id);
    return locationRepository.setActive(id, true);
  }

  async deactivate(id) {
    await this.getById(id);
    return locationRepository.setActive(id, false);
  }

  async softDelete(id) {
    await this.getById(id);
    const deleted = await locationRepository.softDelete(id);
    if (!deleted) {
      throw new AppError("No se pudo eliminar ubicación.", 500, "DELETE_FAILED");
    }
    return deleted;
  }
}

module.exports = new LocationService();
