const eventImageRepository = require("../repository/eventImage.repository");
const eventRepository = require("../repository/event.repository");
const AppError = require("./utils/appError");
const { buildUniqueSlug } = require("./utils/slug");

class EventImageService {
  async getAll({ eventId = null, includeDeleted = false } = {}) {
    return eventImageRepository.findAll({ eventId, includeDeleted });
  }

  async getById(id) {
    try {
      const image = await eventImageRepository.findById(id);
      if (!image) throw new AppError("Imagen no encontrada.", 404, "IMAGE_NOT_FOUND");
      return image;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === "CastError") {
        throw new AppError("ID de imagen no válido.", 400, "INVALID_ID");
      }
      throw error;
    }
  }

  async getBySlug(slug) {
    const image = await eventImageRepository.findBySlug(slug);
    if (!image) {
      throw new AppError("Imagen no encontrada para ese slug.", 404, "IMAGE_NOT_FOUND");
    }
    return image;
  }

  async getByEventId(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError("Evento no encontrado.", 404, "EVENT_NOT_FOUND");
    }

    return eventImageRepository.findByEventId(eventId);
  }

  async create(data) {
    const event = await eventRepository.findById(data.event);
    if (!event) {
      throw new AppError("Evento no encontrado.", 404, "EVENT_NOT_FOUND");
    }

    const slug = await buildUniqueSlug(
      eventImageRepository,
      data.slug || data.alt || `${event.slug}-imagen-${data.position ?? 0}`
    );

    if (!slug) {
      throw new AppError("No se puede generar un slug válido.", 400, "INVALID_SLUG");
    }

    if (data.isCover) {
      await eventImageRepository.clearCover(event._id);
    }

    return eventImageRepository.create({
      ...data,
      slug,
      status: data.status ?? "active",
      is_active: data.is_active ?? true
    });
  }

  async update(id, data) {
    const current = await this.getById(id);
    const updateData = { ...data };

    if (data.event) {
      const event = await eventRepository.findById(data.event);
      if (!event) {
        throw new AppError("Evento no encontrado.", 404, "EVENT_NOT_FOUND");
      }
    }

    if (data.isCover) {
      await eventImageRepository.clearCover(data.event ?? current.event, current._id);
    }

    if (data.slug) {
      updateData.slug = await buildUniqueSlug(
        eventImageRepository,
        data.slug,
        current._id
      );
    }

    return eventImageRepository.updateById(id, updateData);
  }

  async softDelete(id) {
    const image = await eventImageRepository.findById(id, { includeDeleted: true });

    if (!image) {
      throw new AppError("Imagen no encontrada.", 404, "IMAGE_NOT_FOUND");
    }

    if (image.deleted_at) return false;

    await eventImageRepository.softDelete(id);
    return true;
  }
}

module.exports = new EventImageService();
