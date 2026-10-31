const mongoose = require("mongoose");

const revokedTokenSchema = new mongoose.Schema(
  {
    // Hash SHA-256 del JWT. Nunca se guarda el token completo.
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
    expires_at: {
      type: Date,
      required: true
    },
    revoked_at: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      enum: ["logout", "password_change", "status_change", "admin_revoke"],
      default: "logout"
    }
  },
  {
    versionKey: false
  }
);

revokedTokenSchema.index({ token_hash: 1 }, { unique: true });
revokedTokenSchema.index({ user_id: 1 });

// MongoDB elimina automáticamente los registros caducados.
revokedTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RevokedToken", revokedTokenSchema);
