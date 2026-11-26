const mongoose = require("mongoose");

// Registro de los refresh tokens emitidos. Solo se guarda el hash SHA-256, nunca el JWT.
const refreshTokenSchema = new mongoose.Schema(
  {
    token_hash: {
      type: String,
      required: true,
      minlength: 64,
      maxlength: 64
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // Hash del access token vigente de esta sesión; se sustituye en cada refresh.
    access_hash: {
      type: String,
      default: null
    },
    expires_at: {
      type: Date,
      required: true
    },
    // true = revocado / false = vigente
    revoked: {
      type: Boolean,
      default: false
    },
    revoked_at: {
      type: Date,
      default: null
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

refreshTokenSchema.index({ token_hash: 1 }, { unique: true });
refreshTokenSchema.index({ user_id: 1 });

// Sin índice TTL: el registro debe sobrevivir a la caducidad del JWT para
// poder marcarlo como revoked al detectar que la sesión ha caducado.

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
