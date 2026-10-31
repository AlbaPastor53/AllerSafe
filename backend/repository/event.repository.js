const Event = require("../models/event.model");

class EventRepository {
  async findAll({ includeDeleted = false } = {}) {
    const filter = includeDeleted ? {} : { deleted_at: null };
    return Event.find(filter).sort({ date: 1 });
  }

  async countByHostId(hostId) {
    return Event.countDocuments({ host: hostId, deleted_at: null });
  }

  async countByCategoryId(categoryId) {
    return Event.countDocuments({ categories: categoryId, deleted_at: null });
  }

  async countByLocationId(locationId) {
    return Event.countDocuments({ location: locationId, deleted_at: null });
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

  async softDelete(id) {
    return Event.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date(), is_active: false },
      { new: true, runValidators: true }
    );
  }

  async restoreById(id) {
    return Event.findOneAndUpdate(
      { _id: id, deleted_at: { $ne: null } },
      { deleted_at: null, is_active: true },
      { new: true, runValidators: true }
    );
  }

  async updateStatusById(id, status) {
    return Event.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { status },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new EventRepository();
