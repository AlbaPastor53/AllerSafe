const EventImage = require("../models/eventImage.model");

class EventImageRepository {
  async findAll({ eventId = null, includeDeleted = false } = {}) {
    const filter = {};

    if (eventId) filter.event = eventId;
    if (!includeDeleted) filter.deleted_at = null;

    return EventImage.find(filter).sort({ position: 1, created_at: 1 });
  }

  async findById(id, { includeDeleted = false } = {}) {
    const filter = includeDeleted ? { _id: id } : { _id: id, deleted_at: null };
    return EventImage.findOne(filter);
  }

  async findBySlug(slug, { includeDeleted = false } = {}) {
    const filter = includeDeleted
      ? { slug: slug.toLowerCase() }
      : { slug: slug.toLowerCase(), deleted_at: null };
    return EventImage.findOne(filter);
  }

  async findByEventId(eventId, { includeDeleted = false } = {}) {
    return this.findAll({ eventId, includeDeleted });
  }

  async create(data) {
    return EventImage.create(data);
  }

  async updateById(id, data) {
    return EventImage.findOneAndUpdate(
      { _id: id, deleted_at: null },
      data,
      { new: true, runValidators: true }
    );
  }

  async clearCover(eventId, exceptId = null) {
    const filter = { event: eventId, isCover: true, deleted_at: null };

    if (exceptId) filter._id = { $ne: exceptId };

    return EventImage.updateMany(filter, { isCover: false });
  }

  async softDelete(id) {
    return EventImage.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date(), is_active: false },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new EventImageRepository();
