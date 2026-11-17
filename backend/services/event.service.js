const eventRepository = require("../repository/event.repository");
const hostRepository = require("../repository/host.repository");
const categoryRepository = require("../repository/category.repository");
const locationRepository = require("../repository/location.repository");
const eventImageRepository = require("../repository/eventImage.repository");
const departureRepository = require("../repository/departure.repository");
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

const SORT_MAP = {
  date_asc: { date: 1, _id: 1 },
  date_desc: { date: -1, _id: 1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  name_asc: { name: 1, _id: 1 },
  name_desc: { name: -1, _id: 1 }
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class EventService {
  async getAll({
    includeDeleted = false,
    search = null,
    category = [],
    host = [],
    location = [],
    status = null,
    is_active: isActive = undefined,
    page = 1,
    limit = 0,
    sort = "date_asc"
  } = {}) {
    const filter = {};

    if (!includeDeleted) filter.deleted_at = null;
    if (status) filter.status = status;
    if (isActive !== undefined) filter.is_active = isActive;
    if (category.length > 0) filter.categories = { $in: category };
    if (host.length > 0) filter.host = { $in: host };
    if (location.length > 0) filter.location = { $in: location };
    if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };

    const paginated = Number(limit) > 0;
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = paginated ? Number(limit) : 0;
    const skip = paginated ? (safePage - 1) * safeLimit : 0;
    const sortSpec = SORT_MAP[sort] ?? SORT_MAP.date_asc;

    const [events, total] = await Promise.all([
      eventRepository.search({
        filter,
        sort: sortSpec,
        skip,
        limit: safeLimit
      }),
      paginated ? eventRepository.count(filter) : Promise.resolve(0)
    ]);

    await Promise.all(events.map((event) => event.populate(EVENT_POPULATE)));

    return {
      events,
      total: paginated ? total : events.length,
      page: safePage,
      limit: safeLimit
    };
  }

  async getById(id, { includeDeleted = false } = {}) {
    try {
      const event = await eventRepository.findById(id, { includeDeleted });
      if (!event) throw new AppError("Evento no encontrado.", 404, "EVENT_NOT_FOUND");
      if (event.deleted_at) {
        throw new AppError(
          "No se puede modificar un evento eliminado.",
          409,
          "RECORD_DELETED"
        );
      }
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
    const current = await this.getById(id, { includeDeleted: true });

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
    const current = await this.getById(id, { includeDeleted: true });
    await this.assertHost(hostId);

    const event = await eventRepository.updateById(current._id, { host: hostId });
    await event.populate(EVENT_POPULATE);
    return event;
  }

  async updateLocation(id, locationId) {
    const current = await this.getById(id, { includeDeleted: true });
    await this.assertLocation(locationId);

    const event = await eventRepository.updateById(current._id, { location: locationId });
    await event.populate(EVENT_POPULATE);
    return event;
  }

  async addCategories(id, categoryIds) {
    const current = await this.getById(id, { includeDeleted: true });
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
    const current = await this.getById(id, { includeDeleted: true });

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

    const [imageCount, departureCount] = await Promise.all([
      eventImageRepository.countByEventId(id),
      departureRepository.countByEventId(id)
    ]);

    if (imageCount > 0 || departureCount > 0) {
      throw new AppError(
        "No se puede eliminar un evento que tiene imágenes o salidas asociadas.",
        409,
        "EVENT_HAS_RELATIONS"
      );
    }

    await eventRepository.softDelete(id);
    return true;
  }

  async restore(id) {
    const event = await eventRepository.findById(id, { includeDeleted: true });

    if (!event) {
      throw new AppError("Evento no encontrado.", 404, "EVENT_NOT_FOUND");
    }

    if (!event.deleted_at) {
      throw new AppError("El evento no está eliminado.", 409, "ALREADY_ACTIVE");
    }

    const slugConflict = await eventRepository.findBySlug(event.slug);
    if (slugConflict) {
      throw new AppError(
        "Ya existe un evento activo con ese slug.",
        409,
        "RESTORE_CONFLICT"
      );
    }

    const restored = await eventRepository.restoreById(id);
    await restored.populate(EVENT_POPULATE);
    return restored;
  }

  async changeStatus(id, status) {
    const event = await eventRepository.findById(id, { includeDeleted: true });

    if (!event) {
      throw new AppError("Evento no encontrado.", 404, "EVENT_NOT_FOUND");
    }

    if (event.deleted_at) {
      throw new AppError(
        "No se puede cambiar el estado de un evento eliminado.",
        409,
        "RECORD_DELETED"
      );
    }

    const updated = await eventRepository.updateStatusById(id, status);
    await updated.populate(EVENT_POPULATE);
    return updated;
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
