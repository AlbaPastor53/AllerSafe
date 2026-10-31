const Profile = require("../models/profile.model");

function withSession(options, session) {
  return session ? { ...options, session } : options;
}

class ProfileRepository {
  async findByUserId(userId, { includeDeleted = false, session = null } = {}) {
    const filter = includeDeleted
      ? { user_id: userId }
      : { user_id: userId, deleted_at: null };
    const query = Profile.findOne(filter);

    if (session) query.session(session);

    return query;
  }

  async create(data, { session = null } = {}) {
    if (session) {
      const [profile] = await Profile.create([data], { session });
      return profile;
    }

    return Profile.create(data);
  }

  async updateByUserId(userId, data, { session = null } = {}) {
    return Profile.findOneAndUpdate(
      { user_id: userId, deleted_at: null },
      data,
      withSession({ new: true, runValidators: true }, session)
    );
  }

  async upsertByUserId(userId, data, { session = null } = {}) {
    const { user_id: _ignoredUserId, ...profileData } = data;

    return Profile.findOneAndUpdate(
      { user_id: userId },
      {
        $set: { ...profileData, deleted_at: null },
        $setOnInsert: { user_id: userId }
      },
      withSession(
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        },
        session
      )
    );
  }

  async softDeleteByUserId(userId, { session = null } = {}) {
    return Profile.findOneAndUpdate(
      { user_id: userId, deleted_at: null },
      { deleted_at: new Date() },
      withSession({ new: true, runValidators: true }, session)
    );
  }

  async restoreByUserId(userId, { session = null } = {}) {
    return Profile.findOneAndUpdate(
      { user_id: userId, deleted_at: { $ne: null } },
      { deleted_at: null },
      withSession({ new: true, runValidators: true }, session)
    );
  }
}

module.exports = new ProfileRepository();
