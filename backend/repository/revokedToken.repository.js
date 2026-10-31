const RevokedToken = require("../models/revokedToken.model");

function withSession(options, session) {
  return session ? { ...options, session } : options;
}

class RevokedTokenRepository {
  async existsByHash(tokenHash, { session = null } = {}) {
    const query = RevokedToken.exists({ token_hash: tokenHash });

    if (session) query.session(session);

    return Boolean(await query);
  }

  async revoke({ tokenHash, userId, expiresAt, reason = "logout" }, { session = null } = {}) {
    try {
      return await RevokedToken.findOneAndUpdate(
        { token_hash: tokenHash },
        {
          $setOnInsert: {
            token_hash: tokenHash,
            user_id: userId,
            expires_at: expiresAt,
            revoked_at: new Date(),
            reason
          }
        },
        withSession({ upsert: true, new: true }, session)
      );
    } catch (error) {
      // Dos logout simultáneos del mismo token son idempotentes.
      if (error.code === 11000) return null;
      throw error;
    }
  }

  async deleteByUserId(userId, { session = null } = {}) {
    return RevokedToken.deleteMany(
      { user_id: userId },
      withSession({}, session)
    );
  }
}

module.exports = new RevokedTokenRepository();
