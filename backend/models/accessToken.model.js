const mongoose = require("mongoose");

// Registro de los access tokens emitidos. Solo se guarda el hash SHA-256, nunca el JWT.
const accessTokenSchema = new mongoose.Schema(
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

accessTokenSchema.index({ token_hash: 1 }, { unique: true });
accessTokenSchema.index({ user_id: 1 });

// Sin índice TTL: el registro debe sobrevivir a la caducidad del JWT para
// poder marcarlo como revoked junto al refresh al cerrar la sesión.

module.exports = mongoose.model("AccessToken", accessTokenSchema);
