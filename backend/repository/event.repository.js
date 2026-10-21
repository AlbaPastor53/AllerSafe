const Event = require("../models/event.model");

class EventRepository {
  async findAll({ includeDeleted = false } = {}) {
    const filter = includeDeleted ? {} : { deleted_at: null };
    return Event.find(filter).sort({ date: 1 });
  }

  async findById(id, { includeDeleted = false } = {}) {
    const filter = includeDeleted ? { _id: id } : { _id: id, deleted_at: null };
    return Event.findOne(filter);
  }

  async findBySlug(slug, { includeDeleted = false } = {}) {
    const filter = includeDeleted
      ? { slug: slug.toLowerCase() }
      : { slug: slug.toLowerCase(), deleted_at: null };
    return Event.findOne(filter);
  }

  async create(data) {
    return Event.create(data);
  }

  async updateById(id, data) {
    return Event.findOneAndUpdate(
      { _id: id, deleted_at: null },
      data,
      { new: true, runValidators: true }
    );
  }

  async setActive(id, isActive) {
    return Event.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { isActive },
      { new: true, runValidators: true }
    );
  }

  async softDelete(id) {
    return Event.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date(), isActive: false, status: "cancelled" },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new EventRepository();
