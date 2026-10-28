const User = require("../models/user.model");

class UserRepository {
  async findAll({ includeDeleted = false } = {}) {
    const filter = includeDeleted ? {} : { deleted_at: null };
    return User.find(filter).sort({ name: 1 });
  }

  async findById(id, { includeDeleted = false } = {}) {
    const filter = includeDeleted ? { _id: id } : { _id: id, deleted_at: null };
    return User.findOne(filter);
  }

  async findByEmail(email, { includeDeleted = false } = {}) {
    const filter = includeDeleted
      ? { email: email.toLowerCase() }
      : { email: email.toLowerCase(), deleted_at: null };
    return User.findOne(filter);
  }

  async create(data) {
    return User.create(data);
  }

  async updateById(id, data) {
    return User.findOneAndUpdate(
      { _id: id, deleted_at: null },
      data,
      { new: true, runValidators: true }
    );
  }

  async setActive(id, isActive) {
    return User.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { isActive },
      { new: true, runValidators: true }
    );
  }

  async softDelete(id) {
    return User.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date(), isActive: false },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new UserRepository();
