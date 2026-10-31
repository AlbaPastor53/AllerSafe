const Host = require("../models/host.model");

class HostRepository {
  async findAll({ includeDeleted = false } = {}) {
    const filter = includeDeleted ? {} : { deleted_at: null };
    return Host.find(filter).sort({ created_at: 1 });
  }

  async findById(id, { includeDeleted = false } = {}) {
    const filter = includeDeleted ? { _id: id } : { _id: id, deleted_at: null };
    return Host.findOne(filter);
  }

  async findByUserId(userId, { includeDeleted = false } = {}) {
    const filter = includeDeleted
      ? { user_id: userId }
      : { user_id: userId, deleted_at: null };
    return Host.findOne(filter);
  }

  async countByUserId(userId) {
    return Host.countDocuments({ user_id: userId, deleted_at: null });
  }

  async findBySlug(slug, { includeDeleted = false } = {}) {
    const filter = includeDeleted
      ? { slug: slug.toLowerCase() }
      : { slug: slug.toLowerCase(), deleted_at: null };
    return Host.findOne(filter);
  }

  async create(data) {
    return Host.create(data);
  }

  async updateById(id, data) {
    return Host.findOneAndUpdate(
      { _id: id, deleted_at: null },
      data,
      { new: true, runValidators: true }
    );
  }

  async softDelete(id) {
    return Host.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date(), is_active: false },
      { new: true, runValidators: true }
    );
  }

  async restoreById(id) {
    return Host.findOneAndUpdate(
      { _id: id, deleted_at: { $ne: null } },
      { deleted_at: null, is_active: true },
      { new: true, runValidators: true }
    );
  }

  async updateStatusById(id, status) {
    return Host.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { status },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new HostRepository();
