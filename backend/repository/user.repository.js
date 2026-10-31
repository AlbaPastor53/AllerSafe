const User = require("../models/user.model");

function withSession(options, session) {
  return session ? { ...options, session } : options;
}

class UserRepository {
  async findAll({ includeDeleted = false } = {}) {
    const filter = includeDeleted ? {} : { deleted_at: null };
    return User.find(filter).sort({ name: 1 });
  }

  async findById(id, { includeDeleted = false, session = null } = {}) {
    const filter = includeDeleted ? { _id: id } : { _id: id, deleted_at: null };
    const query = User.findOne(filter);

    if (session) query.session(session);

    return query;
  }

  async findByEmail(
    email,
    { includeDeleted = false, includePassword = false, session = null } = {}
  ) {
    const filter = includeDeleted
      ? { email: email.toLowerCase() }
      : { email: email.toLowerCase(), deleted_at: null };
    const query = User.findOne(filter);

    if (includePassword) query.select("+password_hash");
    if (session) query.session(session);

    return query;
  }

  async findBySlug(slug, { includeDeleted = false, session = null } = {}) {
    const filter = includeDeleted
      ? { slug: slug.toLowerCase() }
      : { slug: slug.toLowerCase(), deleted_at: null };
    const query = User.findOne(filter);

    if (session) query.session(session);

    return query;
  }

  async create(data, { session = null } = {}) {
    if (session) {
      const [user] = await User.create([data], { session });
      return user;
    }

    return User.create(data);
  }

  async updateById(id, data, { session = null } = {}) {
    return User.findOneAndUpdate(
      { _id: id, deleted_at: null },
      data,
      withSession({ new: true, runValidators: true }, session)
    );
  }

  async setHostId(id, hostId, { session = null } = {}) {
    return User.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { host_id: hostId },
      withSession({ new: true, runValidators: true }, session)
    );
  }

  async incrementTokenVersion(id, { session = null } = {}) {
    return User.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { $inc: { token_version: 1 } },
      withSession({ new: true, runValidators: true }, session)
    );
  }

  async softDelete(id, { session = null } = {}) {
    return User.findOneAndUpdate(
      { _id: id, deleted_at: null },
      {
        $set: {
          deleted_at: new Date(),
          is_active: false,
          status: "inactive"
        },
        $inc: { token_version: 1 }
      },
      withSession({ new: true, runValidators: true }, session)
    );
  }

  async restoreById(id, { session = null } = {}) {
    return User.findOneAndUpdate(
      { _id: id, deleted_at: { $ne: null } },
      {
        $set: {
          deleted_at: null,
          is_active: true,
          status: "active"
        },
        $inc: { token_version: 1 }
      },
      withSession({ new: true, runValidators: true }, session)
    );
  }

  async updateStatusById(id, status, { session = null } = {}) {
    return User.findOneAndUpdate(
      { _id: id, deleted_at: null },
      {
        $set: {
          status,
          is_active: status === "active"
        },
        $inc: { token_version: 1 }
      },
      withSession({ new: true, runValidators: true }, session)
    );
  }
}

module.exports = new UserRepository();
