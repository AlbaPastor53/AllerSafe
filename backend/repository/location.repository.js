const Location = require("../models/location.model");

class LocationRepository {
  async findAll({ includeDeleted = false } = {}) {
    const filter = includeDeleted ? {} : { deleted_at: null };
    return Location.find(filter).sort({ name: 1 });
  }

  async findById(id, { includeDeleted = false } = {}) {
    const filter = includeDeleted ? { _id: id } : { _id: id, deleted_at: null };
    return Location.findOne(filter);
  }

  async findBySlug(slug, { includeDeleted = false } = {}) {
    const filter = includeDeleted
      ? { slug: slug.toLowerCase() }
      : { slug: slug.toLowerCase(), deleted_at: null };
    return Location.findOne(filter);
  }

  async create(data) {
    return Location.create(data);
  }

  async updateById(id, data) {
    return Location.findOneAndUpdate(
      { _id: id, deleted_at: null },
      data,
      { new: true, runValidators: true }
    );
  }

  async softDelete(id) {
    return Location.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date(), is_active: false },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new LocationRepository();
