const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    password_hash: {
      type: String,
      required: false,
      select: false
    },
    role: {
      type: String,
      enum: ["Admin", "Client"],
      default: "Client",
      index: true
    },
    // Permite invalidar todos los tokens de un usuario sin recorrer la blacklist.
    token_version: {
      type: Number,
      default: 0,
      min: 0
    },
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
      index: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
      index: true
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
    deleted_at: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    versionKey: false
  }
);

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { deleted_at: null } }
);

userSchema.index({ slug: 1 }, { unique: true });

userSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

userSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  this.set({ updated_at: new Date() });
  next();
});

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password_hash;
    delete ret.token_version;
    return ret;
  }
});

module.exports = mongoose.model("User", userSchema);
