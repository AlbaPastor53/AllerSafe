const eventRepository = require("../repository/event.repository");
const AppError = require("./utils/appError");

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

class EventService {
  async getAll(options = {}) {
    return eventRepository.findAll(options);
  }

  async getById(id) {
    try {
      const event = await eventRepository.findById(id);
      if (!event) throw new AppError("Evento no encontrado.", 404, "EVENT_NOT_FOUND");
      return event;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === "CastError") {
        throw new AppError("ID de evento no válido.", 400, "INVALID_ID");
      }
      throw error;
    }
  }

  async getBySlug(slug) {
    const normalizedSlug = slugify(slug);
    const event = await eventRepository.findBySlug(normalizedSlug);

    if (!event) {
      throw new AppError("Evento no encontrado para ese slug.", 404, "EVENT_NOT_FOUND");
    }

    return event;
  }

  async create(data) {
    const slug = slugify(data.slug || data.name);
    if (!slug) {
      throw new AppError("No se puede generar un slug válido.", 400, "INVALID_SLUG");
    }

    const existing = await eventRepository.findBySlug(slug, { includeDeleted: true });
    if (existing) {
      throw new AppError("Ya existe un evento con ese slug.", 409, "SLUG_EXISTS");
    }

    return eventRepository.create({
      ...data,
      slug,
      isActive: data.isActive ?? true,
      status: data.status ?? "published"
    });
  }

  async update(id, data) {
    await this.getById(id);

    const updateData = { ...data };
    if (data.name && !data.slug) {
      updateData.slug = slugify(data.name);
    } else if (data.slug) {
      updateData.slug = slugify(data.slug);
    }

    if (updateData.slug) {
      const existing = await eventRepository.findBySlug(updateData.slug, { includeDeleted: true });
      if (existing && String(existing._id) !== String(id)) {
        throw new AppError("Ya existe otro evento con ese slug.", 409, "SLUG_EXISTS");
      }
    }

    return eventRepository.updateById(id, updateData);
  }

  async activate(id) {
    await this.getById(id);
    return eventRepository.setActive(id, true);
  }

  async deactivate(id) {
    await this.getById(id);
    return eventRepository.setActive(id, false);
  }

  async softDelete(id) {
    await this.getById(id);
    const deleted = await eventRepository.softDelete(id);

    if (!deleted) {
      throw new AppError("No se pudo eliminar el evento.", 500, "DELETE_FAILED");
    }

    return deleted;
  }
}

module.exports = new EventService();
