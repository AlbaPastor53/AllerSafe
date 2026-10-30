const eventRepository = require("../repository/event.repository");
const hostRepository = require("../repository/host.repository");
const categoryRepository = require("../repository/category.repository");
const locationRepository = require("../repository/location.repository");
const AppError = require("./utils/appError");
const { buildUniqueSlug } = require("./utils/slug");

const EVENT_POPULATE = [
  {
    path: "host",
    populate: { path: "user_id", select: "name email role status is_active" }
  },
  { path: "categories", select: "name slug status is_active" },
  { path: "location", select: "name address slug status is_active" },
  {
    path: "images",
    match: { deleted_at: null },
    options: { sort: { position: 1, created_at: 1 } }
  }
];

class EventService {
  async getAll(options = {}) {
    const events = await eventRepository.findAll(options);
    await Promise.all(events.map((event) => event.populate(EVENT_POPULATE)));
    return events;
  }

  async getById(id) {
    try {
      const event = await eventRepository.findById(id);
      if (!event) throw new AppError("Evento no encontrado.", 404, "EVENT_NOT_FOUND");
      await event.populate(EVENT_POPULATE);
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
    const event = await eventRepository.findBySlug(slug);

    if (!event) {
      throw new AppError("Evento no encontrado para ese slug.", 404, "EVENT_NOT_FOUND");
    }

    await event.populate(EVENT_POPULATE);
    return event;
  }

  async create(data) {
    await this.assertRelations(data);

    const slug = await buildUniqueSlug(eventRepository, data.slug || data.name);
    if (!slug) {
      throw new AppError("No se puede generar un slug válido.", 400, "INVALID_SLUG");
    }

    const event = await eventRepository.create({
      ...data,
      slug,
      status: data.status ?? "draft",
      is_active: data.is_active ?? true
    });

    await event.populate(EVENT_POPULATE);
    return event;
  }

  async update(id, data) {
    const current = await this.getById(id);

    await this.assertRelations(data);

    const updateData = { ...data };

    if (data.name || data.slug) {
      updateData.slug = await buildUniqueSlug(
        eventRepository,
        data.slug || data.name,
        current._id
      );
    }

    const event = await eventRepository.updateById(id, updateData);
    await event.populate(EVENT_POPULATE);
    return event;
  }

  async updateHost(id, hostId) {
    const current = await this.getById(id);
    await this.assertHost(hostId);

    const event = await eventRepository.updateById(current._id, { host: hostId });
    await event.populate(EVENT_POPULATE);
    return event;
  }

  async updateLocation(id, locationId) {
    const current = await this.getById(id);
    await this.assertLocation(locationId);

    const event = await eventRepository.updateById(current._id, { location: locationId });
    await event.populate(EVENT_POPULATE);
    return event;
  }

  async addCategories(id, categoryIds) {
    const current = await this.getById(id);
    await this.assertCategories(categoryIds);

    const merged = new Set(
      (current.categories ?? []).map((category) => String(category._id ?? category))
    );

    categoryIds.forEach((categoryId) => merged.add(String(categoryId)));

    const event = await eventRepository.updateById(current._id, {
      categories: [...merged]
    });

    await event.populate(EVENT_POPULATE);
    return event;
  }

  async removeCategory(id, categoryId) {
    const current = await this.getById(id);

    const remaining = (current.categories ?? [])
      .map((category) => String(category._id ?? category))
      .filter((value) => value !== String(categoryId));

    if (remaining.length === 0) {
      throw new AppError(
        "El evento debe mantener al menos una categoría.",
        400,
        "CATEGORY_REQUIRED"
      );
    }

    const event = await eventRepository.updateById(current._id, {
      categories: remaining
    });

    await event.populate(EVENT_POPULATE);
    return event;
  }

  async softDelete(id) {
    const event = await eventRepository.findById(id, { includeDeleted: true });

    if (!event) {
      throw new AppError("Evento no encontrado.", 404, "EVENT_NOT_FOUND");
    }

    if (event.deleted_at) return false;

    await eventRepository.softDelete(id);
    return true;
  }

  async assertRelations(data) {
    if (data.host) await this.assertHost(data.host);
    if (data.location) await this.assertLocation(data.location);
    if (data.categories) await this.assertCategories(data.categories);
  }

  async assertHost(hostId) {
    const host = await hostRepository.findById(hostId);

    if (!host) {
      throw new AppError("El anfitrión indicado no existe.", 404, "HOST_NOT_FOUND");
    }
  }

  async assertLocation(locationId) {
    const location = await locationRepository.findById(locationId);

    if (!location) {
      throw new AppError("La ubicación indicada no existe.", 404, "LOCATION_NOT_FOUND");
    }
  }

  async assertCategories(categoryIds) {
    const uniqueIds = [...new Set((categoryIds ?? []).map(String))];

    if (uniqueIds.length === 0) {
      throw new AppError(
        "Debe asignar al menos una categoría.",
        400,
        "CATEGORY_REQUIRED"
      );
    }

    const categories = await Promise.all(
      uniqueIds.map((categoryId) => categoryRepository.findById(categoryId))
    );

    if (categories.some((category) => !category)) {
      throw new AppError(
        "Alguna de las categorías indicadas no existe.",
        404,
        "CATEGORY_NOT_FOUND"
      );
    }
  }
}

module.exports = new EventService();
