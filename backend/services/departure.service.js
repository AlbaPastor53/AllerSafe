const departureRepository = require("../repository/departure.repository");
const eventRepository = require("../repository/event.repository");
const AppError = require("./utils/appError");
const { buildUniqueSlug } = require("./utils/slug");

const DEPARTURE_POPULATE = {
  path: "event",
  select: "name slug status is_active"
};

class DepartureService {
  async getAll({ eventId = null, includeDeleted = false } = {}) {
    const departures = await departureRepository.findAll({ eventId, includeDeleted });
    await Promise.all(departures.map((departure) => departure.populate(DEPARTURE_POPULATE)));
    return departures;
  }

  async getById(id) {
    try {
      const departure = await departureRepository.findById(id);
      if (!departure) {
        throw new AppError("Salida no encontrada.", 404, "DEPARTURE_NOT_FOUND");
      }
      await departure.populate(DEPARTURE_POPULATE);
      return departure;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === "CastError") {
        throw new AppError("ID de salida no válido.", 400, "INVALID_ID");
      }
      throw error;
    }
  }

  async getBySlug(slug) {
    const departure = await departureRepository.findBySlug(slug);
    if (!departure) {
      throw new AppError("Salida no encontrada para ese slug.", 404, "DEPARTURE_NOT_FOUND");
    }
    await departure.populate(DEPARTURE_POPULATE);
    return departure;
  }

  async create(data) {
    const event = await eventRepository.findById(data.event);
    if (!event) {
      throw new AppError("Evento no encontrado.", 404, "EVENT_NOT_FOUND");
    }

    this.validateDates(data.start_datetime, data.end_datetime);
    this.validateCapacity(data.capacity, data.booked_participants ?? 0);

    const slug = await buildUniqueSlug(
      departureRepository,
      data.slug || this.defaultSlug(event, data.start_datetime)
    );

    if (!slug) {
      throw new AppError("No se puede generar un slug válido.", 400, "INVALID_SLUG");
    }

    const departure = await departureRepository.create({
      ...data,
      slug,
      booked_participants: data.booked_participants ?? 0,
      status: data.status ?? "scheduled",
      is_active: data.is_active ?? true
    });

    await departure.populate(DEPARTURE_POPULATE);
    return departure;
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

    const start = data.start_datetime ?? current.start_datetime;
    const end = data.end_datetime ?? current.end_datetime;
    const capacity = data.capacity ?? current.capacity;
    const booked = data.booked_participants ?? current.booked_participants;

    this.validateDates(start, end);
    this.validateCapacity(capacity, booked);

    if (data.slug) {
      updateData.slug = await buildUniqueSlug(
        departureRepository,
        data.slug,
        current._id
      );
    }

    const departure = await departureRepository.updateById(id, updateData);
    await departure.populate(DEPARTURE_POPULATE);
    return departure;
  }

  async softDelete(id) {
    const departure = await departureRepository.findById(id, { includeDeleted: true });

    if (!departure) {
      throw new AppError("Salida no encontrada.", 404, "DEPARTURE_NOT_FOUND");
    }

    if (departure.deleted_at) return false;

    await departureRepository.softDelete(id);
    return true;
  }

  validateDates(start, end) {
    if (!start || !end || new Date(end) <= new Date(start)) {
      throw new AppError(
        "end_datetime debe ser posterior a start_datetime.",
        400,
        "INVALID_DEPARTURE_DATES"
      );
    }
  }

  validateCapacity(capacity, bookedParticipants) {
    if (bookedParticipants > capacity) {
      throw new AppError(
        "booked_participants no puede superar capacity.",
        400,
        "INVALID_DEPARTURE_CAPACITY"
      );
    }
  }

  defaultSlug(event, startDatetime) {
    const datePart = new Date(startDatetime)
      .toISOString()
      .slice(0, 16)
      .replace("T", "-")
      .replace(":", "");

    return `${event.slug}-${datePart}`;
  }
}

module.exports = new DepartureService();
