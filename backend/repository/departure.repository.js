const Departure = require("../models/departure.model");

class DepartureRepository {
  async findAll({ eventId = null, includeDeleted = false } = {}) {
    const filter = {};

    if (eventId) filter.event = eventId;
    if (!includeDeleted) filter.deleted_at = null;

    return Departure.find(filter).sort({ start_datetime: 1 });
  }

  async findById(id, { includeDeleted = false } = {}) {
    const filter = includeDeleted ? { _id: id } : { _id: id, deleted_at: null };
    return Departure.findOne(filter);
  }

  async findBySlug(slug, { includeDeleted = false } = {}) {
    const filter = includeDeleted
      ? { slug: slug.toLowerCase() }
      : { slug: slug.toLowerCase(), deleted_at: null };
    return Departure.findOne(filter);
  }

  async create(data) {
    return Departure.create(data);
  }

  async updateById(id, data) {
    return Departure.findOneAndUpdate(
      { _id: id, deleted_at: null },
      data,
      { new: true, runValidators: true }
    );
  }

  async softDelete(id) {
    return Departure.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date(), is_active: false },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new DepartureRepository();
