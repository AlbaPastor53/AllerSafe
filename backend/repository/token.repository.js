const AccessToken = require("../models/accessToken.model");
const RefreshToken = require("../models/refreshToken.model");

async function register(model, { tokenHash, userId, expiresAt, extra = {} }) {
  return model.findOneAndUpdate(
    { token_hash: tokenHash },
    {
      $set: {
        user_id: userId,
        expires_at: expiresAt,
        revoked: false,
        revoked_at: null,
        ...extra
      },
      $setOnInsert: { token_hash: tokenHash }
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function isActive(model, tokenHash) {
  return Boolean(await model.exists({ token_hash: tokenHash, revoked: false }));
}

async function revoke(model, tokenHash) {
  return model.findOneAndUpdate(
    { token_hash: tokenHash },
    { $set: { revoked: true, revoked_at: new Date() } },
    { new: true }
  );
}

class TokenRepository {
  registerAccess({ tokenHash, userId, expiresAt }) {
    return register(AccessToken, { tokenHash, userId, expiresAt });
  }

  registerRefresh({ tokenHash, userId, expiresAt, accessHash }) {
    return register(RefreshToken, {
      tokenHash,
      userId,
      expiresAt,
      extra: { access_hash: accessHash }
    });
  }

  isAccessActive(tokenHash) {
    return isActive(AccessToken, tokenHash);
  }

  findRefresh(tokenHash) {
    return RefreshToken.findOne({ token_hash: tokenHash });
  }

  revokeAccess(tokenHash) {
    return revoke(AccessToken, tokenHash);
  }

  revokeRefresh(tokenHash) {
    return revoke(RefreshToken, tokenHash);
  }

  setRefreshAccessHash(tokenHash, accessHash) {
    return RefreshToken.findOneAndUpdate(
      { token_hash: tokenHash },
      { $set: { access_hash: accessHash } },
      { new: true }
    );
  }

  // Revoca la sesión completa: el refresh y el access que tenga asociado.
  async revokeSessionByRefreshHash(tokenHash) {
    const refreshRecord = await this.findRefresh(tokenHash);
    if (!refreshRecord) return null;

    await Promise.all([
      revoke(RefreshToken, tokenHash),
      refreshRecord.access_hash
        ? revoke(AccessToken, refreshRecord.access_hash)
        : Promise.resolve(null)
    ]);

    return refreshRecord;
  }
}

module.exports = new TokenRepository();
